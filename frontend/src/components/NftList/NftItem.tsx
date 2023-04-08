import Button from '../UI/Button'

type NftItemProps = {
  imageUri: string
  title: string
  description: string
}

const NftItem = ({ imageUri, title, description }: NftItemProps) => {
  return (
    <div className="basis-1/4 mr-12 text-white">
      <img src={imageUri} className="h-96 w-96 object-cover border rounded border-[#000B29]" />
      <div className="flex">
        <div className="flex flex-col">
          <p>Title: {title}</p>
          <p>Description: {description}</p>
          <p>Price: 0.1 ETH</p>
        </div>
        <Button className="my-4 mx-12" label="BUY (soon)" />
      </div>
    </div>
  )
}

export default NftItem
