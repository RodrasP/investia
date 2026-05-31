router.get('/:id', (req, res) => {
  const courseId = req.params.id;
  const token = req.headers['authorization']?.split(' ')[1];

  const fetchCourseDetails = (isAdmin: boolean, userId: number | null) => {
    console.log(`Fetching course details for id: ${courseId}, userId: ${userId}, isAdmin: ${isAdmin}`);
    
    db.get('SELECT * FROM courses WHERE id = ?', [courseId], (err: any, course: any) => {
      if (err) {
        console.error('Database error fetching course:', err);
        return res.status(500).json({ message: 'Database error fetching course' });
      }
      if (!course) return res.status(404).json({ message: 'Course not found' });
      
      if (course.visibility === 'private' && !isAdmin) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const checkAccess = (callback: (hasAccess: boolean) => void) => {
        if (isAdmin || course.access_level === 'free') return callback(true);
        if (!userId) return callback(false);

        db.get('SELECT role, subscription_status FROM users WHERE id = ?', [userId], (err: any, user: any) => {
          if (err) {
            console.error('Error fetching user for access check:', err);
            return callback(false);
          }
          if (user?.subscription_status === 'premium') return callback(true);
          
          db.get('SELECT id FROM user_subscriptions WHERE user_id = ? AND course_id = ?', [userId, courseId], (err: any, sub: any) => {
            if (err) {
              console.error('Error fetching subscription:', err);
              return callback(false);
            }
            callback(!!sub);
          });
        });
      };

      checkAccess((hasAccess) => {
        if (!hasAccess && course.access_level === 'premium') {
          console.log(`Access denied: course is premium and user ${userId} does not have access`);
          return res.status(403).json({ message: 'Premium access required' });
        }

        db.all('SELECT * FROM topics WHERE course_id = ? ORDER BY sort_order ASC', [courseId], (err: any, topics: any[]) => {
          if (err) {
            console.error('Error fetching topics:', err);
            return res.status(500).json({ message: 'Error fetching topics' });
          }

          db.all('SELECT * FROM lessons WHERE course_id = ? ORDER BY sort_order ASC', [courseId], (err: any, lessons: any[]) => {
            if (err) {
              console.error('Error fetching lessons:', err);
              return res.status(500).json({ message: 'Error fetching lessons' });
            }

            db.all('SELECT lesson_id, COUNT(*) as count FROM questions GROUP BY lesson_id', [], (err: any, qCounts: any[]) => {
              if (err) {
                console.error('Error fetching question counts:', err);
                return res.status(500).json({ message: 'Error fetching question counts' });
              }

              const countsMap = (qCounts || []).reduce((acc: any, curr: any) => {
                acc[curr.lesson_id] = curr.count;
                return acc;
              }, {});

              const fetchStars = (callback: (stars: number, cooldownActive: boolean, levelToShow: number) => void) => {
                if (!userId) return callback(0, false, 0);
                db.get('SELECT stars, last_completed_at FROM user_completed_courses WHERE user_id = ? AND course_id = ?', [userId, courseId], (err: any, row: any) => {
                  if (err) {
                    console.error('Error fetching stars:', err);
                    return callback(0, false, 0);
                  }
                  const stars = row?.stars || 0;
                  let cooldownActive = false;
                  if (stars > 0 && stars < 3 && row?.last_completed_at) {
                    const lastCompleted = new Date(row.last_completed_at);
                    const now = new Date();
                    const diffHours = (now.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60);
                    if (diffHours < 5) cooldownActive = true;
                  }
                  const levelToShow = (cooldownActive && stars > 0) ? stars - 1 : Math.min(stars, 2);
                  callback(stars, cooldownActive, levelToShow);
                });
              };

              fetchStars((stars, cooldownActive, levelToShow) => {
                const fetchProgress = (level: number, cb: (ids: number[]) => void) => {
                  if (!userId) return cb([]);
                  db.all('SELECT lesson_id FROM user_progress WHERE user_id = ? AND level = ?', [userId, level], (err: any, rows: any[]) => {
                    if (err) {
                      console.error('Error fetching progress:', err);
                      return cb([]);
                    }
                    cb((rows || []).map(r => r.lesson_id));
                  });
                };

                fetchProgress(levelToShow, (completedLessonIds) => {
                  const lessonsWithStatus = (lessons || []).map(l => ({
                    ...l,
                    isCompleted: completedLessonIds.includes(l.id),
                    questionCount: countsMap[l.id] || 0
                  }));

                  const topicsWithLessons = (topics || []).map(t => {
                    const topicLessons = lessonsWithStatus.filter(l => l.topic_id === t.id);
                    const isCompleted = topicLessons.length > 0 && topicLessons.every(l => l.isCompleted);
                    return { ...t, lessons: topicLessons, isCompleted };
                  });

                  db.get('SELECT last_completed_at FROM user_completed_courses WHERE user_id = ? AND course_id = ?', [userId, courseId], (err: any, row: any) => {
                    const untrackedLessons = lessonsWithStatus.filter(l => !l.topic_id);
                    res.json({ 
                      ...course, 
                      topics: topicsWithLessons, 
                      untrackedLessons, 
                      lessons: lessonsWithStatus,
                      stars,
                      currentLevel: levelToShow,
                      cooldownActive,
                      last_completed_at: row?.last_completed_at || null
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  };

  if (token && token !== 'null') {
    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err: any, decoded: any) => {
      const userId = decoded?.id || null;
      if (err) {
        fetchCourseDetails(false, null);
      } else {
        db.get('SELECT role FROM users WHERE id = ?', [userId], (err: any, user: any) => {
          fetchCourseDetails(user?.role === 'admin', userId);
        });
      }
    });
  } else {
    fetchCourseDetails(false, null);
  }
});
