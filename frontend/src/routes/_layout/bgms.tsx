import { Container, Heading } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/bgms")({
  component: Bgms,
})

function Bgms() {
  return (
    <Container maxW="full">
      <Heading size="lg" pt={12}>
        Bgms List
      </Heading>
    </Container>
  )
}