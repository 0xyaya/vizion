import useGouvernance from 'src/hooks/useGouvernance';
import { Button } from '../UI';

export type Proposal = {
  id: number;
  tokenId: number;
  title: string;
  description: string;
  imageUri: string;
  author: string;
  voteCount: number;
};

export type ProposalItemProps = Proposal & {
  votingTime: boolean;
};
const ProposalItem = ({
  id,
  tokenId,
  title,
  description,
  imageUri,
  author,
  votingTime,
  voteCount
}: ProposalItemProps) => {
  const { vote } = useGouvernance(true);

  return (
    <div className="flex justify-between items-center p-4 bg-red-50 border border-[#000B29] rounded-md">
      <div className="flex flex-col flex-start items-center">
        <img
          src={imageUri}
          alt="test"
          className="h-96 w-96 object-cover border rounded border-[#000B29]"
        />
      </div>
      <div className="flex flex-col h-full justify-between p-2">
        <div className="flex flex-col mx-4">
          <div>Title: {title}</div>
          <div>Author: {author}</div>
          <div>Description: {description}</div>
        </div>
        <div className="flex flex-col space-y-4 justify-center">
          <Button label="Details(soon)" />
          {votingTime && (
            <Button
              onClick={() => vote(id)}
              color="bg-red-500 text-white hover:bg-red-400"
              label="Voter"
            />
          )}
          {votingTime && <p>Vote count: {voteCount}</p>}
        </div>
      </div>
    </div>
  );
};

export default ProposalItem;
