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

const FairtalePage = ({ fairytale }: PageProps) => {
  const [storyImages, setStoryImages] = useState<any>([])
  const [isLoading, setIsLoading] = useState(false)

  const { title, generateText, copiedPrompt } = fairytale

  const generateNewStoryImage = async (a, b, c) => {
    // Add code here to genereate a new story image based on sanity data, be creative!

    let imagePromt: string

    if (!a) {
      imagePromt = `Can write a chapter of a story about a fantasy world that involves ${title}.`
    }

    if (!c) {
      imagePromt = `Can write a chapter of a story about a fantasy world that involves ${title}. In the previous chapter the events of ${a} happened. This is the final chapter.`
    }

    imagePromt = `Can write a chapter of a story about a fantasy world that involves ${title}. In the previous chapter the events of ${a} happened. In this chapter, the events of ${b} happen. In the next chapter, ${c} happens.`

    setStoryImages([])

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

      if (response.text) {
        return response.text
      } else {
        console.log('error')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleGenerateImages = async () => {
    setIsLoading(true)

    const prompts = generateText
      .split('. ')
      .map((p) => p.split('! ').map((p) => p + '!'))
      .flat()
      .slice(0, -1)

    const images = await Promise.all(
      prompts.map(async (_, i, arr) => ({
        prompt: arr[i],
        image: await generateNewStoryImage(arr[i - 1], arr[i], arr[i + 1]),
      }))
    )

    setStoryImages(images)

    setIsLoading(false)
  }

  return (
    <>
      <NavigationBar />
      <main className="pb-10">

        <div className="w-1/2 m-auto">

          <h1 className="mt-8">{title}</h1>
          <p className="mt-20">{generateText}</p>

          {isLoading && <p>Loading...</p>}
          <button
            className="p-10 my-10 text-white bg-red-900 rounded-md"
            onClick={handleGenerateImages}
          >
            Let's see the story with images
          </button>
          {storyImages.map((storyImage) => (
            <div key={storyImage.prompt}>
              <p className="my-8">
                <strong>{storyImage.prompt}</strong>
              </p>
              <Image
                src={storyImage.image}
                alt={storyImage.prompt}
                width={512}
                height={512}
                className="m-auto border shadow"
              />
            </div>
          ))}
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
