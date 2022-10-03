import { React, useState, useEffect, useRef } from 'react'
import '../Events/Events.css'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

import profimg from '../Events/assets/profile.png'
import Post from './Post'
import PostPageModal from './PostPageModal'

import events from './assets/events.png'
import tasks from './assets/tasks.png'
import voting from './assets/events.png'
import chat from './assets/chat.png'
import notifications from './assets/notifications.png'
import settings from './assets/settings.jpg'

const Updates = ({ user, server, showHomeToggle }) => {
  const [updates, setUpdates] = useState([])
  const [prevUpdates, setPrevUpdates] = useState([])
  const lastPostRef = useRef(null)
  const [lastPostDimension, setLastPostDimension] = useState('')
  const [lastUpdatedPost, setLastUpdatedPost] = useState('')
  const [showPostUpdatesStatus, setShowPostUpdatesStatus] = useState(false)
  const [showPostPage, setShowPostPage] = useState(false)
  const [gotUpdates, setGotUpdates] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')
  const [postUpdatesStatus, setPostUpdatesStatus] = useState('')
  const [userImgUrl, setUserImgUrl] = useState(profimg)
  const [highlightedPost, setHighlightedPost] = useState(null)
  const [currentPostShow, setCurrentPostShow] = useState(null)
  const [newPostShow, setNewPostShow] = useState(null)
  const maxNumberOfRequest = 4

  const notify = ({ message }) => {
    setShowNotification(true)
    setNotificationMessage(message)
    getNewUpdates(user.lastPostUpdate)
    setTimeout(() => {
      setShowNotification(false)
    }, 3000)
  }
  const shufflePosts = (array) => {
    var currentIndex = array.length,
      randomIndex,
      temporaryValue
    while (0 !== currentIndex) {
      var randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex -= 1
      temporaryValue = array[currentIndex]
      array[currentIndex] = array[randomIndex]
      array[randomIndex] = temporaryValue
    }
  }
  useEffect(async () => {
    if (user.matricNo !== undefined) {
      try {
        const opts1 = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imgUrl: user.img, matricNo: user.matricNo }),
        }
        const resp1 = await fetch(server + '/getImgUrl', opts1)
        const response1 = await resp1.json()
        const url = response1.url
        setUserImgUrl(url)
      } catch (TypeError) {}
    }
  }, [user])
  useEffect(() => {
    setNewPostShow(currentPostShow)
  }, [currentPostShow])
  const checkLastPostDimension = async () => {
    setLastPostDimension(lastPostRef.current.getBoundingClientRect().y)
  }
  const getNewUpdates = async (lastPostUpdate) => {
    var updateFrom = lastPostUpdate
    if (updateFrom === undefined) {
      updateFrom = Date.now()
    }
    try {
      const opts = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collection: 'NapsPublic',
          data: { createdAt: { $lt: updateFrom } },
          limit: maxNumberOfRequest,
        }),
      }
      const resp = await fetch(server + '/getUpdates', opts)
      const response = await resp.json()
      const updates = response.updates
      setLastUpdatedPost(updates[updates.length - 1])
      shufflePosts(updates)
      setUpdates(() => {
        return updates
      })
      setPrevUpdates(updates)
      setGotUpdates(true)
    } catch (TypeError) {}
  }
  useEffect(() => {
    window.addEventListener('scroll', checkLastPostDimension)
    return () => {
      window.removeEventListener('scroll', checkLastPostDimension)
    }
  }, [lastPostDimension])
  useEffect(() => {
    getNewUpdates(user.lastPostUpdate)
  }, [user])
  useEffect(async () => {
    if (highlightedPost === null) {
      window.sessionStorage.setItem('pageOffset', window.pageYOffset)
    }
    if (
      lastPostDimension < window.innerHeight &&
      updates !== undefined &&
      updates[updates.length - 1] !== undefined &&
      highlightedPost === null
    ) {
      var updateFrom = lastUpdatedPost.createdAt
      if (prevUpdates.length === maxNumberOfRequest) {
        setShowPostUpdatesStatus(true)
        setPostUpdatesStatus('More Updates...')
        try {
          const opts = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              collection: 'NapsPublic',
              data: { createdAt: { $lt: updateFrom } },
              limit: maxNumberOfRequest,
            }),
          }
          const resp = await fetch(server + '/getUpdates', opts)
          const response = await resp.json()
          const updt = response.updates
          setLastUpdatedPost(updt[updt.length - 1])
          if (updt.length < maxNumberOfRequest) {
            setShowPostUpdatesStatus(true)
            setPostUpdatesStatus('No More Updates Available!')
          }
          var isIncludeItem = false
          prevUpdates.forEach((item) => {
            if (updt.includes(item)) {
              isIncludeItem = true
            }
          })
          shufflePosts(updt)
          setPrevUpdates(updt)
          if (!isIncludeItem) {
            setUpdates([...updates, ...updt])
          }
        } catch (TypeError) {}
      } else {
        setShowPostUpdatesStatus(true)
        setPostUpdatesStatus('No More Updates Available!')
      }
    } else {
      setShowPostUpdatesStatus(false)
      setPostUpdatesStatus('')
    }
  }, [lastPostDimension])
  const updatePostAt = async ({ createdAt, refresh, rct }) => {
    try {
      const opts = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collection: 'NapsPublic',
          data: { createdAt: createdAt },
        }),
      }

      const resp = await fetch(server + '/getOneUpdate', opts)
      const response = await resp.json()
      const update = await response.update
      var newUpdates = updates
      var index
      newUpdates.forEach((update, i) => {
        if (update.createdAt === createdAt) {
          index = i
        }
      })
      newUpdates[index] = update
      if (refresh) {
        setUpdates(() => {
          return [...newUpdates]
        })
        if (highlightedPost !== null) {
          setHighlightedPost(() => {
            return update
          })
          update['comment'].forEach((comment, i) => {
            if (currentPostShow !== null) {
              if (comment.createdAt === currentPostShow.createdAt) {
                setNewPostShow(comment)
              }
            } else {
              setNewPostShow(null)
            }
          })
        }
      }
      var done = update
      return done
    } catch (TypeError) {}
  }
  return (
    <>
      <div style={{ paddingTop: highlightedPost !== null ? '50px' : '2px' }}>
        {showNotification && (
          <div
            style={{
              padding: '10px',
              position: 'fixed',
              top: '5px',
              zIndex: '1',
              justifyContent: 'center',
              width: '100vw',
            }}
          >
            <label
              style={{
                margin: 'auto',
                padding: '10px',
                fontSize: '.8rem',
                fontWeight: 'bold',
                fontFamily: 'monospace',
                backgroundColor: 'rgba(0,0,0,0.9)',
                borderRadius: '10px',
                color: 'white',
              }}
            >
              {notificationMessage}
            </label>
          </div>
        )}
        <AnimatePresence>
          {showPostPage && (
            <PostPageModal
              user={user}
              server={server}
              closeModal={() => {
                setShowPostPage(false)
              }}
              notifyUpdate={(message) => {
                notify({ message: message })
              }}
            />
          )}
        </AnimatePresence>
        {highlightedPost === null ? (
          <div
            style={{
              textAlign: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                width: '100%',
                margin: '0px',
                marginBottom: '10px',
                padding: '10px 0px',
                justifyContent: 'center',
                textAlign: 'left',
                backgroundColor: 'rgba(245,245,255,1)',
              }}
            >
              <div
                style={{
                  width: '15%',
                  textAlign: 'left',
                  marginTop: '5px',
                  textShadow: '0px 0px 3px black',
                  color: 'blue',
                  fontFamily: 'monospace',
                  fontSize: '1.3rem',
                  fontWeight: 'bolder',
                }}
              >
                <label>XDot</label>
              </div>
              <div
                style={{
                  width: '80%',
                  boxShadow: '0px 0px 8px black',
                  borderRadius: '20px',
                }}
              >
                <input
                  type='text'
                  placeholder='Search Pages, Posts, Clusters...'
                  style={{
                    padding: '10px',
                    outline: 'none',
                    border: 'solid black 0px',
                    borderRadius: '20px',
                    width: '80%',
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', margin: '10px' }}>
              <Link to='/dashboard/profile'>
                <div
                  style={{
                    boxShadow: '0px 0px 7px black',
                    padding: '3px',
                    borderRadius: '50%',
                    height: '38px',
                    width: '38px',
                    backgroundColor: 'rgba(240,240,240,1)',
                    backgroundSize: 'cover',
                    backgroundImage: `url(${userImgUrl})`,
                    cursor: 'pointer',
                  }}
                ></div>
              </Link>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                onClick={() => {
                  setShowPostPage(true)
                }}
                className='saysm'
              >
                {'Something on your mind?'}
              </motion.div>
            </div>
            <motion.div
              initial={{ x: '100vw' }}
              animate={{ x: 0 }}
              transition={{
                duration: 0.5,
                ease: 'easeInOut',
                when: 'beforeChildren',
                staggerChildren: 1,
              }}
              style={{
                margin: '10px 0px',
                padding: '10px 0px',
                borderTop: 'solid rgba(210,210,210,1) 4px',
                borderBottom: 'solid rgba(210,210,210,1) 4px',
                textAlign: 'left',
                fontFamily: 'monospace',
              }}
            >
              <label
                style={{
                  fontWeight: 'bold',
                  padding: '0px 10px',
                  fontStyle: 'italic',
                }}
              >
                {'Go To >>'}
              </label>
              <motion.div
                transition={{ when: 'beforeChildren', staggerChildren: 1 }}
                style={{
                  margin: '10px 0px',
                  overflowX: 'auto',
                  overflowY: 'hide',
                  flexWrap: 'wrap',
                  backgroundColor: 'rgba(245,245,245,1)',
                  display: 'flex',
                  justifyContent: 'center',
                  height: '170px',
                  flexDirection: 'column',
                }}
              >
                {[
                  { it: 'Chats', img: chat, endpoint: 'chats' },
                  { it: 'Voting', img: voting, endpoint: 'e-voting' },
                  { it: 'Tasks', img: tasks, endpoint: 'tasks' },
                  { it: 'Events', img: events, endpoint: 'events' },
                ].map((item, i) => {
                  return (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        opacity: { duration: 0.6, delay: 0.7 },
                        scale: { duration: 0.3, ease: 'easeOut' },
                      }}
                      whileHover={{ scale: 1.1 }}
                      style={{
                        margin: '10px 20px',
                        width: '150px',
                        height: '180px',
                        backgroundColor: 'white',
                        boxShadow: '0px 0px 5px rgba(0,0,0,1)',
                        borderRadius: '10px',
                        textAlign: 'center',
                        color: 'black',
                        paddingTop: '5px',
                        fontWeight: 'bold',
                      }}
                    >
                      <label>{item.it}</label>

                      <Link
                        key={i}
                        style={{ textDecoration: 'none' }}
                        to={'/dashboard/' + item.endpoint}
                      >
                        <div
                          style={{
                            width: '120px',
                            height: '120px',
                            margin: 'auto',
                            marginTop: '10px',
                            backgroundImage: `url(${item.img})`,
                            backgroundSize: 'cover',
                          }}
                        ></div>
                      </Link>
                    </motion.div>
                  )
                })}
              </motion.div>
            </motion.div>
            <div
              style={{
                padding: '10px',
                marginBottom: '20px',
                justifyContent: 'center',
                // borderBottom: 'solid rgba(210,210,210,1) 2px',
              }}
            >
              <button
                onClick={() => {
                  getNewUpdates(user.lastPostUpdate)
                }}
                style={{
                  padding: '7px 20px',
                  borderRadius: '15px',
                  backgroundColor: 'white',
                  color: 'blue',
                  fontFamily: 'monospace',
                  border: 'solid rgba(0,0,255,1) 2px',
                  cursor: 'pointer',
                }}
              >
                New Posts
              </button>
            </div>
          </div>
        ) : undefined}
        {updates.length ? (
          <div>
            <div>
              {highlightedPost === null ? (
                updates.map((update, i) => {
                  return (
                    <Post
                      server={server}
                      key={i}
                      user={user}
                      updt={update}
                      updatePostAt={async ({ createdAt, refresh, rct }) => {
                        var done = await updatePostAt({
                          createdAt: createdAt,
                          refresh: refresh,
                          rct: rct,
                        })
                        return done
                      }}
                      currentPostShow={(post) => {
                        setCurrentPostShow(post)
                      }}
                      setHighlightedPost={(post) => {
                        setHighlightedPost(post)
                      }}
                      showHomeToggle={(show) => {
                        showHomeToggle(show)
                      }}
                    />
                  )
                })
              ) : (
                <Post
                  server={server}
                  status={'highlighted'}
                  user={user}
                  updt={highlightedPost}
                  newPostShow={newPostShow}
                  updatePostAt={async ({ createdAt, refresh, rct }) => {
                    var done = await updatePostAt({
                      createdAt: createdAt,
                      refresh: refresh,
                      rct: rct,
                    })
                    return done
                  }}
                  currentPostShow={(post) => {
                    setCurrentPostShow(post)
                  }}
                  setHighlightedPost={(post) => {
                    setHighlightedPost(post)
                  }}
                  showHomeToggle={(show) => {
                    showHomeToggle(show)
                  }}
                />
              )}
            </div>
            <div ref={lastPostRef} style={{ paddingBottom: '70px' }}>
              {highlightedPost === null && showPostUpdatesStatus ? (
                <label
                  style={{
                    color: 'back',
                    fontWeight: 'bold',
                    fontFamily: 'monospace',
                    fontSize: '.8rem',
                    padding: '10px',
                  }}
                >
                  {postUpdatesStatus}
                </label>
              ) : undefined}
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
            style={{
              fontFamily: 'Courier New',
              fontWeight: 'bold',
              margin: '40px',
              borderRadius: '15px',
              boxShadow: '0px 0px 7px rgba(20,20,20,1)',
              padding: '20px',
            }}
          >
            {gotUpdates
              ? 'Hi, ' +
                user.firstName +
                '. Welcome to XDot Updates.\nMark history in the department by being the first to make a post on this feed.'
              : 'Loading...'}
          </motion.div>
        )}
      </div>
    </>
  )
}

export default Updates
