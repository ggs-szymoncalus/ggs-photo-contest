"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import React from "react";
import { Badge } from "@/components/ui/badge";

export default function SignInPage() {
    const [hovering, setHovering] = React.useState(false);

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4 w-full">
            <Card className="mb-8 w-full max-w-md p-6 text-center">
                <CardHeader className="flex flex-row items-center">
                    <Image
                        src="/GGSPC.svg"
                        alt="Logo"
                        width={100}
                        height={100}
                        className="mx-auto"
                    />
                    <div className="flex flex-col items-baseline space-y-1 text-left">
                        <CardTitle>Log-in to GGS Photo Contest</CardTitle>
                        <CardDescription>
                            Showcase the best moments you've captured every week
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <Carousel
                        className="w-full bg-gray-700 rounded-lg overflow-hidden"
                        plugins={[
                            Autoplay({
                                delay: 2000,
                            }),
                        ]}
                        opts={{
                            loop: true,
                            align: "center",
                        }}
                        onMouseEnter={() => setHovering(true)}
                        onMouseLeave={() => setHovering(false)}
                    >
                        <CarouselContent>
                            <CarouselItem className="flex justify-center relative">
                                <div
                                    className={`absolute z-10 bg-black/50 text-white p-2 rounded-md w-full h-full transition-opacity duration-300 ${
                                        hovering ? "opacity-100" : "opacity-0"
                                    }`}
                                >
                                    <div className="relative flex flex-col justify-between h-full w-full p-2">
                                        <div className="flex flex-row justify-end px-2">
                                            <Badge variant={"secondary"}>Landscape</Badge>
                                        </div>
                                        <div className="text-sm px-2 flex flex-row justify-between items-center">
                                            <strong>Mountain Trip</strong>
                                            <Button
                                                variant={"default"}
                                                className="h-5 w-12 text-xs p-3 bg-green-700 hover:bg-green-800"
                                            >
                                                Vote
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <Image src="/slide1.jpg" alt="Picture 1" width={300} height={200} />
                            </CarouselItem>
                            <CarouselItem className="flex justify-center relative">
                                <div
                                    className={`absolute z-10 bg-black/50 text-white p-2 rounded-md w-full h-full transition-opacity duration-300 ${
                                        hovering ? "opacity-100" : "opacity-0"
                                    }`}
                                >
                                    <div className="relative flex flex-col justify-between h-full w-full p-2">
                                        <div className="flex flex-row justify-end px-2">
                                            <Badge variant={"secondary"}>Selfie</Badge>
                                        </div>
                                        <div className="text-sm px-2 flex flex-row justify-between items-center">
                                            <strong>Looking good!</strong>
                                            <Button
                                                variant={"default"}
                                                className="h-5 w-12 text-xs p-3 bg-green-700 hover:bg-green-800"
                                            >
                                                Vote
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <Image
                                    src="/slide2.jpeg"
                                    alt="Picture 2"
                                    width={300}
                                    height={200}
                                />
                            </CarouselItem>
                            <CarouselItem className="flex justify-center relative">
                                <div
                                    className={`absolute z-10 bg-black/50 text-white p-2 rounded-md w-full h-full transition-opacity duration-300 ${
                                        hovering ? "opacity-100" : "opacity-0"
                                    }`}
                                >
                                    <div className="relative flex flex-col justify-between h-full w-full p-2">
                                        <div className="flex flex-row justify-end px-2">
                                            <Badge variant={"secondary"}>Animal</Badge>
                                        </div>
                                        <div className="text-sm px-2 flex flex-row justify-between items-center">
                                            <strong>My Cat</strong>
                                            <Button
                                                variant={"default"}
                                                className="h-5 w-12 text-xs p-3 bg-green-700 hover:bg-green-800"
                                            >
                                                Vote
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <Image src="/slide3.jpg" alt="Picture 3" width={300} height={200} />
                            </CarouselItem>
                        </CarouselContent>
                    </Carousel>
                </CardContent>
                <CardFooter>
                    <Button
                        className="w-full gap-0 bg-[#4A154B] hover:bg-[#4A154B]/80 h-10"
                        onClick={() => signIn("slack")}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            style={{ marginRight: "12px" }}
                            viewBox="0 0 122.8 122.8"
                        >
                            <title>Slack logo</title>
                            <path
                                d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9zm6.5 0c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z"
                                fill="#e01e5a"
                            ></path>
                            <path
                                d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2zm0 6.5c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9h32.3z"
                                fill="#36c5f0"
                            ></path>
                            <path
                                d="M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.2zm-6.5 0c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.7 5.8 70.5 0 77.6 0s12.9 5.8 12.9 12.9v32.3z"
                                fill="#2eb67d"
                            ></path>
                            <path
                                d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9zm0-6.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6z"
                                fill="#ecb22e"
                            ></path>
                        </svg>
                        Sign in with Slack
                    </Button>
                </CardFooter>
            </Card>
        </main>
    );
}
