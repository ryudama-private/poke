import { Container, Heading, Flex, Table, Badge } from "@chakra-ui/react";
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

function PokemonsTable({ pokemons }: { pokemons: Pokemon[] }) {
  return (
    <Table.Root size={{ base: "sm", md: "md" }}>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader w="sm">画像</Table.ColumnHeader>
          <Table.ColumnHeader w="sm">名前</Table.ColumnHeader>
          <Table.ColumnHeader w="sm">タイプ1</Table.ColumnHeader>
          <Table.ColumnHeader w="sm">タイプ2</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {pokemons.map((pokemon) => (
          <Table.Row key={pokemon.id}>
            <Table.Cell>
              <img
                src={`/data/pokemon_images/${encodeURIComponent(pokemon.name)}.png`}
                alt={pokemon.name}
                style={{ width: "48px", height: "48px", objectFit: "contain" }}
              />
            </Table.Cell>
            <Table.Cell>{pokemon.name}</Table.Cell>
            <Table.Cell>
              <Badge colorScheme="teal">{pokemon.type1}</Badge>
            </Table.Cell>
            <Table.Cell>
              {pokemon.type2 ? (
                <Badge colorScheme="purple">{pokemon.type2}</Badge>
              ) : (
                "-"
              )}
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
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
      <PokemonsTable pokemons={pokemons} />
    </Container>
  );
}
