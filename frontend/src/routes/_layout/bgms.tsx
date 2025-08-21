import { Container, Heading, IconButton, Box } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import {
  FaPlay,
  FaStop,
  FaVolumeUp,
  FaVolumeMute,
  FaStepBackward,
  FaStepForward,
} from "react-icons/fa";
// @ts-ignore
export const Route = createFileRoute("/_layout/bgms")({
  component: Bgms,
});

let globalAudioRef: HTMLAudioElement | null = null;
let globalCurrentPlaying: string | null = null;

interface Bgm {
  album: string;
  title: string;
  file_path: string;
  id: string;
}

function Bgms() {
  const [bgms, setBgms] = useState<Bgm[]>([]);
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/bgms")
      .then((res) => res.json())
      .then((data) => {
        setBgms(data);
      });
  }, []);

  // ページ表示時にグローバル値で状態を復元
  useEffect(() => {
    setCurrentPlaying(globalCurrentPlaying);
  }, []);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (globalAudioRef) {
      globalAudioRef.currentTime = value;
      setCurrentTime(value);
    }
  };

  // 前の曲へ
  const handlePrev = () => {
    if (!currentPlaying || bgms.length === 0) return;
    const currentIndex = bgms.findIndex((bgm) => bgm.id === currentPlaying);
    const prevIndex = (currentIndex - 1 + bgms.length) % bgms.length;
    const prevBgm = bgms[prevIndex];
    playAudio(
      `/data/BGM/PokemonRG_Music/${encodeURIComponent(prevBgm.title)}.wav`,
      prevBgm.id
    );
  };

  // 停止
  const handleStop = () => {
    if (globalAudioRef) {
      globalAudioRef.pause();
      globalAudioRef = null;
    }
    globalCurrentPlaying = null;
    setCurrentPlaying(null);
  };

  // 次の曲へ
  const handleNext = () => {
    if (!currentPlaying || bgms.length === 0) return;
    const currentIndex = bgms.findIndex((bgm) => bgm.id === currentPlaying);
    const nextIndex = (currentIndex + 1) % bgms.length;
    const nextBgm = bgms[nextIndex];
    playAudio(
      `/data/BGM/PokemonRG_Music/${encodeURIComponent(nextBgm.title)}.wav`,
      nextBgm.id
    );
  };

  const playAudio = (filePath: string, id: string) => {
    // 同じ曲なら停止
    if (currentPlaying === id) {
      globalAudioRef?.pause();
      globalAudioRef = null;
      globalCurrentPlaying = null;
      setCurrentPlaying(null);
      return;
    }
    // 別曲再生前に既存停止
    if (globalAudioRef) {
      globalAudioRef.pause();
      globalAudioRef = null;
    }
    const audio = new Audio(filePath);
    audio.play();
    globalAudioRef = audio;
    globalCurrentPlaying = id;
    setCurrentPlaying(id);

    audio.onloadedmetadata = () => {
      setDuration(audio.duration);
    };
    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.onended = () => {
      const currentIndex = bgms.findIndex((bgm) => bgm.id === id);
      const nextIndex = (currentIndex + 1) % bgms.length;
      const nextBgm = bgms[nextIndex];
      globalCurrentPlaying = nextBgm.id;
      setCurrentPlaying(nextBgm.id);
      playAudio(
        `/data/BGM/PokemonRG_Music/${encodeURIComponent(nextBgm.title)}.wav`,
        nextBgm.id
      );
    };
  };

  return (
    <>
      <Container maxW="full">
        <Heading size="lg" pt={12}>
          Bgms List
        </Heading>

        {bgms.length > 0 && (
          <Heading size="md" pt={4} pl={10} pb={2}>
            {bgms[0].album}
          </Heading>
        )}

        <Box
          as="ul"
          pl={59}
          pt={2}
          display="grid"
          rowGap={3}
          listStyleType="none"
          m={0}
        >
          {bgms.map((bgm) => {
            const isPlaying = currentPlaying === bgm.id;
            return (
              <Box
                as="li"
                key={bgm.id}
                display="flex"
                alignItems="center"
                fontSize="sm"
              >
                <IconButton
                  aria-label={isPlaying ? "Stop" : "Play"}
                  onClick={() =>
                    playAudio(
                      `/data/BGM/PokemonRG_Music/${encodeURIComponent(bgm.title)}.wav`,
                      bgm.id
                    )
                  }
                  mr={2}
                  size="xs"
                  colorScheme={isPlaying ? "red" : "gray"}
                >
                  <Box as="span">{isPlaying ? <FaStop /> : <FaPlay />}</Box>
                </IconButton>
                {bgm.title}
              </Box>
            );
          })}
        </Box>
      </Container>

      {currentPlaying && (
        <>
          <span
            style={{
              position: "fixed",
              left: "20px",
              bottom: "120px",
              zIndex: 1001,
              fontWeight: "bold",
              fontSize: "1rem",
            }}
          >
            {bgms.find((bgm) => bgm.id === currentPlaying)?.title}
          </span>

          <span
            style={{
              position: "fixed",
              left: "20px",
              bottom: "80px",
              zIndex: 1001,
              fontWeight: "bold",
              fontSize: "1rem",
            }}
          >
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              step="0.1"
              onChange={handleSeek}
              style={{ width: "160px" }}
            />
          </span>

          <Box
            position="fixed"
            bottom="20px"
            left="20px"
            zIndex={1000}
            display="flex"
            gap={2}
            alignItems="center"
            bg="white"
            _dark={{ bg: "gray.700" }}
            p={2}
            borderRadius="md"
            boxShadow="md"
          >
            <IconButton
              aria-label="Mute toggle"
              size="xs"
              variant="ghost"
              onClick={() => {
                setIsMuted(!isMuted);
                if (globalAudioRef) {
                  globalAudioRef.muted = !isMuted;
                }
              }}
            >
              <Box as="span">{isMuted ? <FaVolumeMute /> : <FaVolumeUp />}</Box>
            </IconButton>
            {!isMuted && (
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setVolume(v);
                  if (globalAudioRef) {
                    globalAudioRef.volume = v;
                  }
                }}
                style={{ width: "80px" }}
              />
            )}
            {/* 前の曲 */}
            <IconButton
              aria-label="Previous"
              size="xs"
              variant="ghost"
              onClick={handlePrev}
            >
              <Box as="span">
                <FaStepBackward />
              </Box>
            </IconButton>
            {/* 停止 */}
            <IconButton
              aria-label="Stop"
              size="xs"
              variant="ghost"
              onClick={handleStop}
            >
              <Box as="span">
                <FaStop />
              </Box>
            </IconButton>
            {/* 次の曲 */}
            <IconButton
              aria-label="Next"
              size="xs"
              variant="ghost"
              onClick={handleNext}
            >
              <Box as="span">
                <FaStepForward />
              </Box>
            </IconButton>
          </Box>
        </>
      )}
    </>
  );
}
