import { useContract, useSigner } from 'wagmi';
import { useState, useEffect } from 'react';
import { abi } from '../contracts/collection.json';

const address = process.env.COLLECTION_ADDRESS;

export default function useCollection(hasMounted: boolean) {
  const { data: signerData } = useSigner();
  const [uris, setUris] = useState<string[]>([]);
  const contract = useContract({
    address: address,
    abi: abi,
    signerOrProvider: signerData
  });

  const getTokenUri = async (tokenId: number) => {
    try {
      if (!contract || !signerData) return;
      const response = await contract?.tokenURI(tokenId);
      return response.imageUri;
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    fetchUris();
  }, [hasMounted, contract, signerData]);

  const fetchUris = async () => {
    if (!contract || !signerData) return;

    const filter = await contract?.filters.Transfer(
      null,
      process.env.MARKETPLACE_ADDRESS
    );
    if (!filter) return;

    const events = await contract?.queryFilter(filter);
    if (!events) return;

    const tokenUris = events.map((event) => {
      if (event?.args) {
        return contract
          ?.tokenURI(Number(event?.args['tokenId']))
          .then((uri: string) => uri);
      }
    });

    const response = await Promise.all(tokenUris);
    setUris(response);
  };

  return { getTokenUri, uris };
}
