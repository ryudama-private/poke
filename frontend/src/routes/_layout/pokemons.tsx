import { Container, Heading } from "@chakra-ui/react";
import { List, ListItem } from "@chakra-ui/layout";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

// @ts-ignore
export const Route = createFileRoute("/_layout/pokemons")({
  component: Pokemons,
});

interface Pokemon {
  id: string;
  name: string;
  type1: string;
  type2?: string;
}

function Pokemons() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/pokemons")
      .then((res) => res.json())
      .then((data) => {
        setPokemons(data);
      });
  }, []);

  return (
    <Container maxW="full">
      <Heading size="lg" pt={12}>
        Pokemons List
      </Heading>
      <List spacing={4} pt={4}>
        {pokemons.map((pokemon) => (
          <ListItem key={pokemon.id}>
            {pokemon.name} - {pokemon.type1}
            {pokemon.type2 ? ` / ${pokemon.type2}` : ""}
          </ListItem>
        ))}
      </List>
    </Container>
  );
}
