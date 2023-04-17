import { BlockContentIcon } from '@sanity/icons'
import { Button, Card, Flex, Label, Spinner, Text, TextArea } from '@sanity/ui'
import { useState } from 'react'
import { set, StringInputProps, unset } from 'sanity'

const maxLength = 200

const OpenAISanity = (props: StringInputProps) => {
  const { value, onChange } = props
  const [isLoading, setIsLoading] = useState(false)
  const [prompt, setPrompt] = useState('')

  const callApi = async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          maxToken: maxLength,
        }),
      })

      const data = await response.json()

      return { data: data.text, error: null }
    } catch (e) {
      console.error(e)
      return { data: null, error: e }
    } finally {
      setIsLoading(false)
    }
  }

  const generateStory = async () => {
    const text = await callApi()

    if (text.error) {
      alert('Something went wrong')
    } else {
      onChange(set(text.data))
    }
  }

  return (
    <Card>
      {isLoading && <Spinner />}

      <Card>
        <TextArea
          onChange={(event) => setPrompt(event.currentTarget.value)}
          padding={4}
          placeholder="Once upon a time... "
          value={prompt}
          maxLength={maxLength}
        />
        <Flex justify="flex-end" padding={1}>
          <Label>
            {prompt.length}/{maxLength}
          </Label>
        </Flex>
      </Card>
      <Flex align="baseline" justify="space-between" paddingBottom={4}>
        <Label></Label>
        <Button
          onClick={generateStory}
          icon={BlockContentIcon}
          text="Generate"
          type="button"
          tone="primary"
          padding={[3, 3, 4]}
          disabled={isLoading}
        />
      </Flex>
      <Card paddingTop={4}>
        <Card paddingBottom={4}>
          <Label>AI Response: {value?.length && null} characters</Label>
        </Card>
        <Text>{value}</Text>
        <Flex justify="flex-end" padding={1}></Flex>
      </Card>
    </Card>
  )
}

export default OpenAISanity
