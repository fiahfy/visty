import { type ReactNode, useRef } from 'react'
import { Transition } from 'react-transition-group'

const timeout = 300

type Props = { children: ReactNode; in: boolean }

const WidthTransition = (props: Props) => {
  const { children, in: inProps } = props

  const nodeRef = useRef(null)

  const styles = {
    appear: {
      width: 'auto',
      transition: `width ${timeout}ms ease-in-out`,
    },
    disappear: {
      width: 0,
      transition: `width ${timeout}ms ease-in-out`,
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
            display: 'flex',
            alignItems: 'center',
            // for Experimental
            ...{ interpolateSize: 'allow-keywords' },
            ...transitionStyles[state],
          }}
        >
          {children}
        </div>
      )}
    </Transition>
  )
}

export default WidthTransition
