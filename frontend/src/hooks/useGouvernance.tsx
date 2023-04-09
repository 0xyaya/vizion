import { useState, useEffect } from 'react';
import { useContractRead, useContract, useSigner } from 'wagmi';
import { abi } from '../contracts/gouvernance.json';

const address = process.env.GOUVERNANCE_ADDRESS as `0x`;

interface Proposal {
  proposalId: number;
  uri: string;
  imageUri: string;
  voteCount: number;
  title: string;
  description: string;
  author: string;
}

export default function useGouvernance(hasMounted: boolean) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const { data: signerData } = useSigner();

  const contract = useContract({
    address: address,
    abi: abi,
    signerOrProvider: signerData
  });

  const { data: tokenIds } = useContractRead({
    address: address,
    abi: abi,
    functionName: 's_tokenIds'
  });

  const { data: status } = useContractRead({
    address: address,
    abi: abi,
    functionName: 'getWorkflowStatus'
  });

  const { data: proposalIds } = useContractRead({
    address: address,
    abi: abi,
    functionName: 's_proposalIds'
  });

  const { data: blockLeft } = useContractRead({
    address: address,
    abi: abi,
    functionName: 'getBlockLeft'
  });

  useEffect(() => {
    fetchProposalsWithVote();
  }, [hasMounted, contract, signerData]);

  const fetchVoteWeight = async (tokenId: number, proposalId: number) => {
    if (!contract || !signerData) return;
    const response = await contract.s_proposals(tokenId, proposalId);
    return response;
  };

  const fetchAllProposalAdded = async () => {
    if (!contract || !signerData) return;

    const filter = await contract?.filters.ProposalAdded();
    if (!filter) return;

    const events = await contract?.queryFilter(filter);
    if (!events) return;

    return events;
  };

  const fetchProposalsWithVote = async () => {
    if (!contract || !signerData) return;

    const filter = await contract?.filters.ProposalAdded();
    if (!filter) return;

    const events = await contract?.queryFilter(filter);
    if (!events) return;

    const props = events
      .filter((t) => (t.args ? t.args['uri'] != '' : '')) // Uri not empty
      .filter((t) => (t.args ? t.args['tokenId'] == String(tokenIds) : ''))
      .map((event) => {
        if (event?.args) {
          const proposalId = event?.args['proposalId'];
          const tokenId = event?.args['tokenId'];
          const uri = event?.args['uri']; // ProposalJson data uri NEXT => fetch/parse/get imageUri

          return contract
            ?.s_proposals(tokenId, proposalId)
            .then((proposal: Proposal) => ({
              proposalId: proposalId,
              uri: uri,
              voteCount: Number(proposal.voteCount)
            }));
        }
      });

    const proposalsData = await Promise.all(props);
    setProposals(proposalsData);
  };

  const addProposal = async (tokenUri: string, proposalUri: string) => {
    if (!contract) return;
    try {
      const response = await contract.addProposal(tokenUri, proposalUri);
      return response;
    } catch (error) {
      console.log(error);
    }
  };

  const vote = async (proposalId: number) => {
    if (!contract) return;
    try {
      const response = await contract.vote(proposalId);
      return response;
    } catch (error) {
      console.log(error);
    }
  };

  return {
    contract,
    signerData,
    tokenIds,
    proposalIds,
    status,
    proposals,
    blockLeft,
    addProposal,
    vote,
    fetchVoteWeight,
    fetchAllProposalAdded
  };
}
