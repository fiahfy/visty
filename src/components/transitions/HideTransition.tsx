import { type ReactNode, useRef } from 'react'
import { Transition } from 'react-transition-group'

const timeout = 500

type Props = { children: ReactNode; in: boolean }

const HideTransition = (props: Props) => {
  const { children, in: inProps } = props

  const nodeRef = useRef(null)

  const styles = {
    appear: {
      opacity: 1,
    },
    disappear: {
      opacity: 0,
    },
  }

  const transitionStyles = {
    entering: styles.appear,
    entered: styles.appear,
    exiting: styles.appear,
    exited: styles.disappear,
    unmounted: styles.disappear,
  }

  return (
    <Transition
      in={inProps}
      nodeRef={nodeRef}
      timeout={{ enter: 0, exit: timeout }}
    >
      {(state) => (
        <div
          ref={nodeRef}
          style={{
            ...transitionStyles[state],
          }}
        >
          {children}
        </div>
      )}
    </Transition>
  )
}

export default HideTransition
