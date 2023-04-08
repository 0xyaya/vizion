import React from 'react'
import Count from '../Count'
import { useState, useEffect } from 'react'
import useGouvernance from 'src/hooks/useGouvernance'
import { Button } from '../UI'

type StatusBarProps = {
  onCreate: () => void
}

const StatusBar = ({ onCreate }: StatusBarProps) => {
  const [hasMounted, setHasMounted] = useState(false)
  const { status, blockLeft } = useGouvernance(hasMounted)
  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) return null

  const title = () => {
    if (Number(status) === 0 || Number(status) === 1) return 'Creation Time'

    if (Number(status) === 2) return 'Voting Time'

    if (Number(status) === 3) return 'Something went wront'
  }

  const secToTime = (totalSeconds: number) => {
    let hours = Math.floor(totalSeconds / 3600)
    totalSeconds %= 3600
    let minutes = Math.floor(totalSeconds / 60)
    let seconds = Math.floor(totalSeconds % 60)
    return hours + ':' + minutes + ':' + seconds
  }

  const computeTimeLeft = (blocks: number): number => {
    return blocks * 12
  }

  return (
    <div className="flex bg-[#00248F] border rounded-md border-white my-4 p-4 space-x-4 items-center text-white">
      <h2 className="text-2xl">{title()}</h2>
      <p>
        Countdown: {Number(blockLeft)} blocks left / ~
        {secToTime(computeTimeLeft(Number(blockLeft)))} with 1 block/12sec
      </p>
      <Count />
      {(Number(status) === 1 || Number(status) === 0) && (
        <Button
          onClick={onCreate}
          label="Create"
          color="bg-[#00103D] hover:bg-blue-900 hover:border-blue-900"
        />
      )}
    </div>
  )
}

export default StatusBar
