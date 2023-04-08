import ProposalItem, { Proposal } from './ProposalItem';
import { useEffect, useState } from 'react';
import useGouvernance from 'src/hooks/useGouvernance';
import useHasMounted from 'src/hooks/useHasMounted';

const ProposalList = () => {
  const [votingTime, setVotingTime] = useState(true);
  const hasMounted = useHasMounted();
  const [realProposals, setRealProposals] = useState<Proposal[]>([]);
  const { tokenIds, proposals } = useGouvernance(hasMounted);

  useEffect(() => {
    const fetchData = async () => {
      if (proposals.length === 0) return;
      const rp = await Promise.all(
        proposals.map(async (p) => {
          const response = await fetch(p.uri);
          const json = await response.json();
          return { ...json, id: p.proposalId, voteCount: p.voteCount };
        })
      );
      setRealProposals(rp);
    };
    fetchData();
  }, [proposals]);

  if (!hasMounted) return null;

  return (
    <div className="flex flex-col space-y-4 lg:flex-row lg:space-x-8 lg:space-y-0 mt-16 mb-16">
      {realProposals.map((p, i) => (
        <ProposalItem
          key={i}
          id={p.id}
          tokenId={Number(tokenIds)}
          title={p.title}
          description={p.description}
          imageUri={p.imageUri}
          author={p.author}
          votingTime={votingTime}
          voteCount={p.voteCount}
        />
      ))}
    </div>
  );
};

export default ProposalList;
