import { useState } from 'react';
import StatusBar from 'src/components/StatusBar/StatusBar';
import Modal from 'src/components/Modal';
import { ProposalCreation, ProposalList } from 'src/components/Proposal';
import Layout from './layout';

export default function Home() {
  const [showModal, setShowModal] = useState(false);

  return (
    <Layout>
      <h1 className="text-2xl text-white mb-8">Gouvernance</h1>
      {showModal && (
        <Modal isVisible={showModal} onClose={() => setShowModal(false)}>
          <ProposalCreation />
        </Modal>
      )}
      <StatusBar onCreate={() => setShowModal(true)} />
      <ProposalList />
    </Layout>
  );
}
