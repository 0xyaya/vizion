import { useState, useEffect } from 'react';
import useCollection from 'src/hooks/useCollection';
import useHasMounted from 'src/hooks/useHasMounted';
import NftItem from './NftItem';

type VizionNftMetadata = {
  title: string;
  description: string;
  author: string;
  imageUri: string;
};

type VizionNft = VizionNftMetadata & {
  id: number;
  owner: string;
};

const NftList = () => {
  const [nfts, setNfts] = useState<VizionNft[]>([]);
  const hasMounted = useHasMounted();
  const { getTokenUri, uris } = useCollection(hasMounted);

  useEffect(() => {
    const loadMetadata = async () => {
      const tokens = uris.map(async (uri) => {
        const response = await fetch(uri);
        const jsonData = await response.json();
        return {
          id: 1,
          title: jsonData.title,
          description: jsonData.description,
          author: 'author',
          imageUri: jsonData.imageUri,
          owner: 'owner'
        } as VizionNft;
      });

      const nfts = await Promise.all(tokens);
      setNfts(nfts);
    };

    loadMetadata();
  }, [uris]);

  if (!hasMounted) return null;

  return (
    <div className="flex flex-col lg:flex-wrap gap-1 lg:gap-y-8=4 lg:flex-row mt-8">
      {nfts.map((nft, i) => (
        <NftItem
          key={i}
          imageUri={nft.imageUri}
          title={nft.title}
          description={nft.description}
        />
      ))}
    </div>
  );
};

export default NftList;
