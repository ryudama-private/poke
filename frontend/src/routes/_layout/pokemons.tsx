import { Container, Heading } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/pokemons")({
  component: Pokemons,
})

function Pokemons() {
  return (
    <Container maxW="full">
      <Heading size="lg" pt={12}>
        Pokemons List
      </Heading>
    </Container>
  )
}