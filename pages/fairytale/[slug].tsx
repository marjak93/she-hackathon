/* eslint-disable @next/next/no-img-element */
import NavigationBar from 'components/molecules/NavigationBar'
import { getAllFairytaleSlugs, getFairytale } from 'lib/sanity.client'
import { iFairytale } from 'lib/sanity.queries'
import { GetStaticProps } from 'next'
import Image from 'next/image'
import { useState } from 'react'

interface PageProps {
  fairytale: iFairytale
}

interface Query {
  [key: string]: string
}

const generateNewStoryImage = async () => {
  // Add your code here
}

const handleGenerateStory = async () => {
  // Add your code here
}

const FairtalePage = ({ fairytale }: PageProps) => {
  const [storyImage, setStoryImage] = useState<any>('')
  const [isLoading, setIsLoading] = useState(false)

  const { title, story } = fairytale;


  const generateNewStoryImage = async () => {
    // Add code here to genereate a new story image based on sanity data, be creative!
    const imagePromt = story

    try {
      const response = await fetch('/api/openai-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: imagePromt,
        }),
      }).then((res) => res.json())

      console.log(response)

      if (response.text) {
        setStoryImage(response.text)
      } else {
        console.log('error')
      }
    } catch (err) {
      console.error(err)
      return
    }
  }

  const handleGenerateImage = async () => {
    setIsLoading(true)
    await generateNewStoryImage()
    setIsLoading(false)
  }

  return (
    <>
      <NavigationBar />
      <main className="pb-10">
        <div className='w-1/2 m-auto'>
          <h1 className='mt-8'>{title}</h1>
          <p className='mt-20'>{story}</p>
          <button
            className="p-10 m-5 text-white bg-red-900 rounded-md"
            onClick={handleGenerateImage}
          >
            Generate image
          </button>
          {isLoading && <p>Loading...</p>}



          {storyImage && storyImage.text !== "Sorry, I don't know" && (
            <div>test</div>
            // <Image src={storyImage} alt="" width={256} height={256} />
          )}
        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps<PageProps, Query> = async (ctx) => {
  // Get the slug from the context
  const { params = {} } = ctx

  // Fetch the fairytale with the given slug
  const [fairytale] = await Promise.all([getFairytale(params.slug)])

  // If no fairytale was found, return 404
  if (!fairytale) {
    return {
      notFound: true,
    }
  }

  // Return the fairytale for Next.js to use
  return {
    props: {
      fairytale,
      // revalidate every two hours
      revalidate: 60 * 60 * 2,
    },
  }
}

export const getStaticPaths = async () => {
  // Fetch all fairytale slugs
  const slugs = await getAllFairytaleSlugs()

  return {
    paths: slugs?.map(({ slug }) => `/fairytale/${slug}`) || [],
    fallback: 'blocking',
  }
}

export default FairtalePage
