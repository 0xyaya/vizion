import { useState, useRef, useEffect } from 'react'
import Button from '../UI/Button'
import { create } from 'ipfs-http-client'
import { ImportCandidate } from 'ipfs-core-types/src/utils'
import useDebounce from '../../hooks/useDebounce'
import useGouvernance from 'src/hooks/useGouvernance'

const ProposalCreation = () => {
  const titleRef = useRef<HTMLInputElement>(null)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)
  const authorRef = useRef<HTMLInputElement>(null)

  const [hasMounted, setHasMounted] = useState(false)
  const [imageFile, setImageFile] = useState<File>()
  const [imageString, setImageString] = useState('')
  const [imageUri, setImageUri] = useState('')
  const [proposalUri, setProposalUri] = useState('')
  const [uploaded, setUploaded] = useState(false)
  const { addProposal } = useGouvernance(hasMounted)
  const debounced = useDebounce([proposalUri, imageUri], 500)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  useEffect(() => {
    const call = async () => {
      if (hasMounted && uploaded) {
        await addProposal(proposalUri, proposalUri) // tokenUri / proposalUri
        setUploaded(false)
      }
    }
    call()
  }, [uploaded, imageUri, proposalUri])

  if (!hasMounted) return null

  const uploadToIPFS = async (data: ImportCandidate) => {
    const auth =
      'Basic ' +
      Buffer.from('2NQ90Il41m07ZHxoT8ViejfS10M:195bd430161acbeff218e5f0bf912b90').toString('base64')
    const client = create({
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https',
      headers: {
        authorization: auth
      }
    })
    const created = await client.add(data)
    const uri = `https://ipfs.io/ipfs/${created.path}`
    return uri
  }

  const createProposalHandler = async () => {
    if (imageFile) {
      const uri = await uploadToIPFS(imageFile)
      const json = JSON.stringify({
        title: titleRef.current?.value!,
        description: descriptionRef.current?.value!,
        author: authorRef.current?.value!,
        imageUri: uri
      })

      const pUri = await uploadToIPFS(json)

      console.log('URI: ', pUri)

      setImageUri(uri)
      setProposalUri(pUri)
      setUploaded(true)
    }
  }

  const fileHandler = async (selectorFiles: FileList | null) => {
    if (selectorFiles !== null) {
      setImageString(URL.createObjectURL(selectorFiles[0]))
      setImageFile(selectorFiles[0])
    }
  }

  return (
    <div className="relative flex justify-around items-center bg-[#000514] border border-[#00248F] text-white rounded-md p-4 w-full">
      <div className="flex flex-col space-y-2">
        {imageString && <img alt="test" src={imageString} className="w-64" />}
        <input
          type="file"
          placeholder="the proposal image"
          accept="image/png, image/jpeg"
          onChange={(e) => fileHandler(e.target.files)}
        />
      </div>

      <div className="flex flex-row space-x-4">
        <div className="flex flex-col w-96 space-y-2 text-black">
          <input
            ref={titleRef}
            type="text"
            placeholder="the proposal title"
            className="px-2 py-1 border rounded-lg"
          />
          <input
            ref={authorRef}
            type="text"
            placeholder="the proposal author"
            className="px-2 py-1 border rounded-lg"
          />
          <textarea
            ref={descriptionRef}
            placeholder="the proposal description"
            className="h-32 px-2 py-1 border rounded-lg text-black"
          />
          <div className="flex justify-around">
            <Button onClick={createProposalHandler} label="Create" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProposalCreation
