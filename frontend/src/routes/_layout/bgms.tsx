import { Container, Heading, IconButton } from "@chakra-ui/react"
import { List, ListItem } from "@chakra-ui/layout"
import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { FaPlay } from "react-icons/fa"


// @ts-ignore
export const Route = createFileRoute("/_layout/bgms")({
  component: Bgms,
})

interface Bgm {
  album: string
  title: string
  file_path: string
  id: string
}

function Bgms() {
  const [bgms, setBgms] = useState<Bgm[]>([])

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/bgms")
      .then(res => res.json())
      .then(data => {
        console.log(data)
        setBgms(data)
      })
  }, [])

  const playAudio = (filePath: string) => {
    console.log("Playing audio:", filePath)
    const audio = new Audio(filePath)
    audio.play()
  }

  return (
    <Container maxW="full">
      <Heading size="lg" pt={12}>
        Bgms List
      </Heading>
      <List spacing={2} pt={4}>
        {bgms.map((bgm, idx) => (
          <ListItem key={idx}>
            <IconButton
              aria-label="Play"
              as={FaPlay}
              onClick={() => playAudio(bgm.file_path)}
              mr={2}
            />
            {bgm.album} - {bgm.title}
          </ListItem>
        ))}
      </List>
    </Container>
  )
}