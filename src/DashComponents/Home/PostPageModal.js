import { React, useState, useEffect, useRef, useContext } from 'react'
import { useHistory } from 'react-router-dom'
import { motion } from 'framer-motion'
import './Home.css'

import ContextProvider from '../../ContextProvider'

import cancel from '../Events/assets/close.png'
import wcancel from './assets/close.png'
import camera from './assets/camera.png'
import wcamera from './assets/wcamera.png'

const PostPageModal = ({ closeModal, notifyUpdate, user, server }) => {
  const history = useHistory()
  const postLabel = ['public', 'group', 'napsite']
  const [showUpdateStatus, setShowUpdateStatus] = useState(false)
  const { darkMode } = useContext(ContextProvider)
  const label = {
    napsite: { collection: 'NapsitesFeed', value: 'Napsites' },
    public: { collection: 'NapsPublic', value: 'Public' },
    group: { collection: 'NapsGroup', value: 'Group' },
  }
  const [fields, setFields] = useState({
    postComment: '',
    postTo: 'Public',
  })
  const [enterPressed, setEnterPressed] = useState(false)
  const imgRef = useRef(null)
  const postFieldRef = useRef(null)
  const [convertedFiles, setConvertedFiles] = useState([])
  useEffect(() => {}, [])
  const handleInputChange = (e) => {
    const name = e.target.getAttribute('name')
    const value = e.target.value
    setFields((fields) => {
      return { ...fields, [name]: value }
    })
  }
  useEffect(() => {}, [fields])
  const handlePost = async () => {
    setShowUpdateStatus(true)
    var postTo = fields.postTo
    var collection = 'NapsPublic'
    Object.values(label).forEach((labl) => {
      if (labl.value === fields.shareQuizTo) {
        collection = labl.collection
      }
    })
    var imagesInfo = []
    var imagesName = []
    convertedFiles.forEach((file, i) => {
      var imgSrc = user.matricNo + '_' + String(Date.now() + i)
      var imageInfo = {
        image: file,
        imageName: imgSrc,
        imageType: file.type,
      }
      imagesInfo = imagesInfo.concat(imageInfo)
      imagesName = imagesName.concat(imgSrc)
    })

    try {
      const opts = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collection: collection,
          update: {
            matricNo: user.matricNo,
            postComment: fields.postComment,
            createdAt: Date.now(),
            postPicture: imagesName,
          },
          imagesInfo: imagesInfo,
        }),
      }
      const resp = await fetch(server + '/postQuiz', opts)
      const response = await resp.json()
      const isDelivered = response.isDelivered
      if (isDelivered) {
        closeModal()
        notifyUpdate('Posted to ' + postTo + ' Successfully')
        closeModal()
      }
    } catch (TypeError) {}
  }
  const fileHandler = async (e) => {
    var fileList = []
    var files = e.target.files
    var resize_width = 400
    for (var i = 0; i < files.length; i++) {
      fileList = fileList.concat(files[i])
    }
    fileList.forEach((file) => {
      var reader = new FileReader()
      reader.readAsDataURL(file)
      reader.name = file.name //get the image's name
      reader.size = file.size //get the image's size
      reader.onload = function (event) {
        var img = new Image() //create a image
        img.src = event.target.result //result is base64-encoded Data URI
        img.name = event.target.name //set name (optional)
        img.size = event.target.size //set size (optional)
        img.onload = function (el) {
          var elem = document.createElement('canvas')
          var scaleFactor = resize_width / el.target.width
          var ctx = elem.getContext('2d')
          elem.width = resize_width
          elem.height = el.target.height * scaleFactor

          ctx.drawImage(el.target, 0, 0, elem.width, elem.height)

          var srcEncoded = elem.toDataURL('image/jpeg')
          // setDisplayImg(srcEncoded)
          setConvertedFiles((convertedFiles) => {
            return [...convertedFiles, srcEncoded]
          })
        }
      }
    })
  }
  const setCaretPosition = (el, pos) => {
    const range = document.createRange()
    range.selectNodeContents(el.current)
    range.setStart(range.endContainer, 0)
    const childNodes = el.current.childNodes
    let found = false
    let offset = 0
    for (const childNode of childNodes) {
      if (offset + childNode.textContent.length >= pos) {
        range.setStart(childNode, pos - offset)
        range.setEnd(childNode, pos - offset)
        found = true
        break
      }
      offset += childNode.textContent.length
    }
    if (found) {
      const selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(range)
    }
  }
  const getCaretPosition = (el) => {
    let caretOffset = 0
    const doc = el.current.ownerDocument || el.current.document
    const win = doc.defaultView || doc.parentWindow
    const sel = win.getSelection()
    if (sel.rangeCount > 0) {
      const range = sel.getRangeAt(0)
      const preCaretRange = range.cloneRange()
      preCaretRange.selectNodeContents(el.current)
      preCaretRange.setEnd(range.endContainer, range.endOffset)
      caretOffset = preCaretRange.toString().length
    }

    return caretOffset
  }
  useEffect(() => {
    if (postFieldRef.current !== null) {
      const caretPos = getCaretPosition(postFieldRef)
      postFieldRef.current.textContent = fields.postComment
      if (enterPressed) {
        setCaretPosition(postFieldRef, caretPos + 1)
        setEnterPressed(false)
      } else {
        setCaretPosition(postFieldRef, caretPos)
      }
    }
  }, [fields.postComment])
  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: '100vw' }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.7,
          ease: 'easeOut',
          when: 'beforeChildren',
        }}
        exit={{
          x: '100vw',
          opacity: 0,
          transition: { duration: 0.7, ease: 'easeIn' },
        }}
        className='postmodalpage'
        style={{
          backgroundColor: darkMode
            ? 'rgba(10,10,18,1)'
            : 'rgba(247,247,255,1)',
        }}
      >
        <img
          onClick={() => {
            closeModal()
          }}
          style={{
            position: 'absolute',
            top: '5px',
            left: '5px',
            zIndex: '1',
            borderRadius: '50%',
            cursor: 'pointer',
          }}
          src={darkMode ? wcancel : cancel}
          alt='close post page'
          height='20px'
        />
        <div
          style={{
            margin: 'auto',
            // width: 'fit-content',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              margin: 'auto',
              marginTop: '15px',
              width: 'fit-content',
              padding: '5px 10px',
              borderRadius: '10px',
              fontSize: '1rem',
              fontFamily: 'Courier New',
              fontWeight: 'bold',
            }}
          >
            <label style={{ margin: 'auto' }}>Create a Post</label>
          </div>

          <div
            onChange={handleInputChange}
            style={{
              display: 'block',
              margin: 'auto',
              padding: '5px',
              marginTop: '20px',
              fontWeight: 'bold',
            }}
          >
            <div
              style={{
                margin: '10px',
                marginBottom: '20px',
                width: 'fit-content',
                display: 'flex',
              }}
            >
              <select
                className='updateinput'
                style={{
                  border: 'solid lightgreen 2px',
                  outline: 'none',
                  cursor: 'pointer',
                  color: darkMode ? 'white' : 'black',
                  padding: '5px 10px',
                }}
                name='postTo'
                value={fields.postTo}
              >
                {postLabel.map((labl) => {
                  return (
                    <option style={{ color: 'black' }}>
                      {label[labl].value}
                    </option>
                  )
                })}
              </select>
              <div style={{ margin: 'auto 20px', fontFamily: 'monospace' }}>
                <label>Add pictures</label>
                <input
                  ref={imgRef}
                  type='file'
                  accept='image/*'
                  multiple
                  style={{ display: 'none' }}
                  onChange={fileHandler}
                />
                <img
                  src={darkMode ? wcamera : camera}
                  height='20px'
                  style={{ margin: 'auto 10px', cursor: 'pointer' }}
                  onClick={() => {
                    imgRef.current.click()
                  }}
                />
              </div>
            </div>
            <div
              ref={postFieldRef}
              contentEditable='true'
              placeholder='Say Something...'
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  let caretPos = getCaretPosition(postFieldRef)
                  const value = e.currentTarget.textContent
                  let preVal = value.slice(0, caretPos)
                  let postVal = value.slice(caretPos)
                  setEnterPressed(true)
                  if (postVal.length === 0) {
                    const newValue = value + '\n\n'
                    setFields((fields) => {
                      return { ...fields, postComment: newValue }
                    })
                  } else {
                    let newPreVal = preVal + '\n'
                    const newValue = newPreVal + postVal
                    setFields((fields) => {
                      return { ...fields, postComment: newValue }
                    })
                  }
                } else {
                  setEnterPressed(false)
                }
              }}
              onInput={(e) => {
                const value = e.currentTarget.textContent
                setFields((fields) => {
                  return { ...fields, postComment: value }
                })
              }}
              style={{
                margin: 'auto',
                textAlign: 'left',
                backgroundColor: darkMode ? 'black' : 'white',
                padding: '10px',
                color: darkMode ? 'white' : 'black',
                fontSize: '1rem',
                fontFamily: 'calibri',
                fontWeight: 'normal',
                whiteSpace: 'pre-wrap',
                borderRadius: '10px',
                maxHeight: '300px',
                height: '200px',
                overflowY: 'auto',
                margin: 'auto',
                outline: 'none',
                width: '90%',
              }}
            ></div>
          </div>
          {convertedFiles.length ? (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                margin: '10px',
                width: 'fit-content',
              }}
            >
              {convertedFiles.map((convertedFile, i) => {
                return (
                  i <= 4 && (
                    <div
                      key={i}
                      style={{
                        position: 'relative',
                        width: 'fit-content',
                        cursor: 'pointer',
                        margin: '7px',
                      }}
                    >
                      <img
                        src={convertedFile}
                        height='100px'
                        style={{ cursor: 'pointer' }}
                      />
                      {i === 4 && convertedFiles.length > 5 && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '0px',
                            left: '0px',
                            zIndex: '1',
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            width: '100%',
                            height: '100%',
                          }}
                        >
                          {convertedFiles.length > 5 && (
                            <div
                              style={{
                                color: 'white',
                                marginTop: '20px',
                                fontSize: '2rem',
                                fontWeight: 'bold',
                                flexWrap: 'wrap',
                              }}
                            >
                              {'+' + String(convertedFiles.length - 5)}
                            </div>
                          )}
                        </div>
                      )}
                      {i <= 4 && (
                        <img
                          onClick={() => {
                            setConvertedFiles((convertedFiles) => {
                              return convertedFiles.filter(
                                (convertedFile, index) => {
                                  return index !== i
                                }
                              )
                            })
                          }}
                          style={{
                            position: 'absolute',
                            padding: '3px',
                            borderRadius: '50%',
                            border: 'solid black 1px',
                            background: darkMode ? 'rgba(10,10,10,1)' : 'white',
                            bottom: '-5px',
                            right: '-5px',
                            zIndex: '1',
                            borderRadius: '50%',
                            cursor: 'pointer',
                          }}
                          src={darkMode ? wcancel : cancel}
                          alt='remove post picture'
                          height='10px'
                        />
                      )}
                    </div>
                  )
                )
              })}
            </div>
          ) : undefined}
          {(fields.postComment || convertedFiles.length > 0) && (
            <div
              style={{
                width: 'fit-content',
                margin: '20px',
                marginRight: 'auto',
                marginLeft: '10px',
              }}
            >
              <button
                onClick={handlePost}
                style={{
                  marginRight: 'auto',
                  fontFamily: 'monospace',
                  fontSize: '1rem',
                  padding: '10px',
                  borderRadius: '10px',
                  backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'white',
                  color: darkMode ? 'lightgreen' : 'green',
                  border: darkMode ? 'solid lightgreen 2px' : 'solid green 2px',
                  cursor: 'pointer',
                }}
              >
                {'Post >>'}
              </button>
            </div>
          )}
          <div style={{ margin: '50px' }}></div>
          {showUpdateStatus && (
            <p>
              <label
                style={{
                  color: 'green',
                  backgroundColor: 'lightgreen',
                  borderRadius: '10px',
                  padding: '10px',
                  marginBottom: '50px',
                  fontStyle: 'italic',
                  fontSize: '.8rem',
                  border: 'solid green 2px',
                }}
              >
                {'Posting. Please Wait...'}
              </label>
            </p>
          )}
        </div>
      </motion.div>
    </>
  )
}

export default PostPageModal
