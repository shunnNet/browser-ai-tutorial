const RecommendProducts = () => {
  return (
    <div className="flex rounded-lg ring-1 ring-gray-300 overflow-hidden shadow-md my-4">
      <img
        className="w-[150px] h-[150px] object-cover block"
        width="300"
        height="200"
        src="https://picsum.photos/seed/picsum/300/200"
        alt="fake img"
      />
      <div className="flex flex-col flex-grow">
        <div className="p-4 flex-grow">
          <div className="flex justify-between mb-2">
            <div>Product</div>
            <div>$300</div>
          </div>

          <div className="text-gray-400">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse iste
            voluptate architecto ab, quae natus nam quod consequatur illo.
            Asperiores quam consectetur iusto nam eum enim reprehenderit
            voluptatem assumenda quibusdam?
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecommendProducts
