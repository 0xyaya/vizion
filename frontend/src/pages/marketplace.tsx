import Layout from './layout';
import NftList from 'src/components/NftList/NftList';

function Marketplace() {
  return (
    <Layout>
      <h1 className="text-2xl text-white mb-8">Marketplace</h1>
      <NftList />
    </Layout>
  );
}

export default Marketplace;
