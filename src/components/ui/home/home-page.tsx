"use client";
import React, { useEffect, useState } from "react";

import toast, { Toaster } from "react-hot-toast";
import { ArrowCircleUp, ArrowBendDownLeft, Lamp } from "@phosphor-icons/react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Notes from "@/components/ui/home/notes";

import { fileToGenerativePart } from "@/lib/actions";
import { run } from "@/app/api/gemini";
import ResponseComponent from "@/components/ui/response-component";

export default function HomePage() {
  const [textValue, setTextValue] = useState<string>("");
  const [imageParts, setImageParts] = useState<Array<Object>>([]);
  const [apikeys, setApikeys] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  // const [safety, setSafety] = useState<string>("");
  const [maxToken, setMaxToken] = useState<number>(0);
  const [generationConfig, setGenerationConfig] = useState<Object>({});

  const handleButtonClick = () => {
    const fileInput = document.getElementById("picture");
    fileInput?.click();
  };

  useEffect(() => {
    getValues();
  }, [textValue, imageParts]);

  const getValues = async () => {
    if (localStorage !== undefined) {
      // Check for configuration settings
      if (localStorage.getItem("apikey")) {
        await setApikeys(localStorage.getItem("apikey") || "");
      } else {
        await setApikeys("");
      }

      if (localStorage.getItem("token")) {
        await setMaxToken(parseInt(localStorage.getItem("token") || ""));

        // await setSafety(localStorage.getItem("safety") || "");
      } else {
        setMaxToken(0);
      }
    }
  };

  // Generation Configuration
  useEffect(() => {
    if (maxToken > 0) {
      setGenerationConfig({
        maxOutputTokens: maxToken,
      });
    } else {
      setGenerationConfig({});
    }
  }, [maxToken, textValue]);

  const handleSubmit = (event: any) => {
    event.preventDefault();
    setLoading(true);
    getValues();

    console.log("maxToken", maxToken);

    if (maxToken > 0) {
      console.log("This line is getting executed");
      setGenerationConfig({
        maxNumTokens: maxToken,
      });
    }

    // Packing text and images into an object called message and send it to the api
    try {
      if (imageParts === undefined || imageParts.length == 0) {
        const message = {
          text: textValue.trim(),
        };

        run(message, apikeys, generationConfig).then((response) => {
          setResponse(response);
        });
      } else {
        const message = {
          text: textValue.trim(),
          imageParts: imageParts,
        };

        // Take the message object and send it to the api
        run(message, apikeys, generationConfig)
          .then((response) => {
            if (response.length > 0 && response !== undefined) {
              setResponse(response);
            }
          })
          .catch((error) => {
            console.log("Error", error);
          });
      }
    } catch (error) {
      console.log("Failed to send message");
    } finally {
      setImageParts([]);
      setTextValue("");
      setLoading(false);
    }
  };

  const handleImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Add multiple images at once
    let files = event.target.files;

    //Calculate the size of the images
    // let totalSize = 0;
    // for (let i = 0; i < (files?.length ?? 0); i++) {
    //   if (files && files[i]) {
    //     totalSize += files[i].size;
    //   }
    // }

    // // API only supports 4MB at once
    // if (totalSize > 4000000) {
    //   toast.error("Please select images less than 4MB");
    //   return;
    // }

    // API only supports 16 images at once
    // if (files?.length ?? 0 > 16) {
    //   toast.error("Please select less than 16 images");
    //   return;
    // }

    if (files && files.length > 0) {
      toast.success(` ${files.length} Files selected`);

      // Convert to generative parts and store in an array of objects

      const generativePart: Array<Object> = [];
      for (let i = 0; i < files.length; i++) {
        fileToGenerativePart(files[i]).then((base64Image) => {
          generativePart.push(base64Image);
          setImageParts(generativePart);
        });
      }
    } else {
      toast.error("No files selected");
    }
  };

  return (
    <>
      <Toaster />
      <div className="flex flex-col  items-center text-center w-dvw absolute top-20 ">
        <div className=" flex flex-col justify-center items-center">
          <Lamp size={70} weight="fill" className="mb-5" />
          <h1 className="text-7xl text-center flex items-center justify-center font-extrabold tracking-tight lg:text-9xl">
            Genie
          </h1>
          <p className="text-xl text-muted-foreground mt-2">
            A lite version to test Google&apos;s Gemini model.
          </p>
        </div>
        <div className=" relative top-10 w-auto h-auto">
          <Card className="flex flex-col justify-center items-center h-auto px-2  sm:w-96">
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col  justify-center items-center  w-auto ">
                <Textarea
                  placeholder=" Ask anything"
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  className="  h-16 relative placeholder:text-base placeholder:font-semibold border-none top-2 mb-5 focus:border-none w-full "
                />

                <div className="flex flex-row justify-end items-end mt-2  w-64 mr-2 mb-3">
                  <Button
                    className="rounded-full p-2  w-10 h-10   bg-amber-900"
                    type="button"
                    onClick={handleButtonClick}
                  >
                    <ArrowCircleUp size={25} weight="fill" />
                    <Input
                      className="mr-2 ml-2"
                      id="picture"
                      type="file"
                      accept="image/jpeg, image/png , image/jpg , image/webp, image/heic , image/heif"
                      onChange={handleImages}
                      style={{ display: "none" }}
                      multiple
                    />
                  </Button>
                  <Button
                    type="submit"
                    disabled={textValue.length === 0 || loading}
                    className="ml-2 rounded-full p-2  w-10 h-10 bg-black dark:bg-white"
                  >
                    <ArrowBendDownLeft size={25} weight="fill" className="" />
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
        <div className="flex flex-col justify-center items-center  w-auto relative mx-3 top-16">
          {loading && (
            <p className="text-xl text-muted-foreground mt-2 animate-pulse">
              Generating response...
            </p>
          )}

          {response.length > 0 ? (
            <>
              <ResponseComponent response={response} />
            </>
          ) : (
            <Notes />
          )}

          <footer className=" relative text-center mx-auto">
            <p className="leading-7 [&:not(:first-child)]:mt-6">
              Crafted with ❤️ by{" "}
              <a
                className=" text-blue-500 font-sans font-semibold"
                href="https://github.com/thenameisajay"
              >
                @thenameisajay
              </a>
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}
