import { ReactNode, useRef } from 'react'
import { Transition } from 'react-transition-group'

type Props = { children: ReactNode; in: boolean; timeout: number }

const FadeAndScale = (props: Props) => {
  const { children, in: inProps, timeout } = props

  const nodeRef = useRef(null)

  const styles = {
    appear: {
      opacity: 1,
      transform: 'scale(1)',
      transition: `opacity ${0}ms ease-in-out, transform ${0}ms ease-in-out`,
    },
    disappear: {
      opacity: 0,
      transform: 'scale(2)',
      transition: `opacity ${timeout}ms ease-in-out, transform ${timeout}ms ease-in-out`,
    },
  }

  const transitionStyles = {
    entering: styles.appear,
    entered: styles.appear,
    exiting: styles.disappear,
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

export default FadeAndScale
