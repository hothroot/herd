
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const PhotoCarousel = () => {
  return (
    <Carousel className="w-full max-w-lg">
      <CarouselContent>
        <CarouselItem key="1">
            <img src="/home-carousel-3.webp" width="512" height="256"></img>
        </CarouselItem>
        <CarouselItem key="2">
            <img src="/home-carousel-2.webp" width="512" height="256"></img>
        </CarouselItem>
        <CarouselItem key="4">
            <img src="/home-carousel-4.webp" width="512" height="256"></img>
        </CarouselItem>
      </CarouselContent>
      <CarouselPrevious className="relative left-0 translate-x-0"/>
      <CarouselNext className="relative left-0 translate-x-0"/>
    </Carousel>
  );
};

export default PhotoCarousel;
