import React, { useEffect, useRef } from 'react'

const Acts = ({ title, content, clickVar, id }) => {
  return (
    <div key={id} className='acts'>
      <div>
        <label
          style={{
            margin: '10px',
            fontWeight: 'bold',
            borderBottom: 'solid rgba(49,49,50,1) 2px',
          }}
        >
          {title}
        </label>
      </div>
      <div
        style={{
          margin: '10px',
          marginTop: '30px',
          fontFamily: 'Courier New',
          border: 'solid rgba(49,49,50,1) 2px',
          padding: '10px',
          borderRadius: '10px',
        }}
      >
        {content}
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '0px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        <button
          style={{
            padding: '10px',
            paddingTop: '5px',
            border: 'solid blue 2px',
            fontFamily: 'monospace',
            paddingBottom: '5px',
            borderRadius: '10px',
            backgroundColor: 'blue',
            color: 'white',
            outline: 'none',
            margin: 'auto',
            cursor: 'pointer',
          }}
        >
          {clickVar}
        </button>
      </div>
    </div>
  )
}
const Events = ({ setRef }) => {
  const event = useRef(null)
  useEffect(() => {
    setRef(event)
  }, [])
  const eventsList = [
    {
      title: 'CGPA CALCULATOR',
      content: 'Calculate and Store Your CGPA Here.',
      clickVar: 'Check It Out!',
    },
    {
      title: 'QUIZ APPLICATION',
      content: 'Create, Take, and Post Quiz Here.',
      clickVar: 'Check It Out!',
    },
    {
      title: 'TO DO LIST',
      content: 'Store, Order, and Strategize Your Tasks, Goals, and Aim Here.',
      clickVar: 'List That Aim Here!',
    },
    {
      title: 'PAY DUES',
      content: 'Pay Your Departmental Dues Here!',
      clickVar: 'Pay For It Here!',
    },
  ]
  return (
    <>
      <div
        ref={event}
        style={{
          color: 'white',
          padding: '50px auto',
          backgroundColor: 'rgba(31,29,29,1)',
          display: 'block',
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(31,29,29,1)',
            fontSize: '1rem',
            fontFamily: 'Courier New',
            padding: '10px',
          }}
        >
          Check Out The Features Available To You
        </div>
        <div className='events'>
          {eventsList.map((event, id) => {
            return (
              <div key={id}>
                <Acts
                  id={id}
                  title={event.title}
                  content={event.content}
                  clickVar={event.clickVar}
                />
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default Events
