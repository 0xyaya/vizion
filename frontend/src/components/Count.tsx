import { useEffect, useState } from 'react'
import useGouvernance from 'src/hooks/useGouvernance'

const Count = () => {
  const [hasMounted, setHasMounted] = useState(false)
  const { proposalIds } = useGouvernance(hasMounted)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) return null

  return (
    <>
      <div>Proposal Count: {Number(proposalIds) ? Number(proposalIds) : 'Error'}</div>
    </>
  )
}

export default Count
