import { useEffect, useState } from 'react';
import useGouvernance from 'src/hooks/useGouvernance';
import useHasMounted from 'src/hooks/useHasMounted';

const Count = () => {
  const hasMounted = useHasMounted();
  const { proposalIds } = useGouvernance(hasMounted);

  if (!hasMounted) return null;

  return (
    <>
      <div>
        Proposal Count: {Number(proposalIds) ? Number(proposalIds) : 'Error'}
      </div>
    </>
  );
};

export default Count;
