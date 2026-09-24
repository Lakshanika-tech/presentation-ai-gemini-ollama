"use server";

import { utapi } from "@/app/api/uploadthing/core";
import {
  type ImageAspectRatio,
  type ImageModelList,
} from "@/constants/image-models";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { UTFile } from "uploadthing/server";

async function persistGeneratedImage(
  imageUrl: string,
  prompt: string,
  userId: string,
  filePrefix: string,
) {
  const imageResponse = await fetch(imageUrl);

  if (!imageResponse.ok) {
    throw new Error("Failed to download generated image");
  }

  const imageBlob = await imageResponse.blob();
  const imageBuffer = await imageBlob.arrayBuffer();

  const filename = `${filePrefix}_${Date.now()}.png`;

  const utFile = new UTFile(
    [new Uint8Array(imageBuffer)],
    filename,
  );

  const uploadResult = await utapi.uploadFiles([utFile]);

  if (!uploadResult[0]?.data?.ufsUrl) {
    throw new Error("Failed to upload generated image");
  }

  return db.generatedImage.create({
    data: {
      url: uploadResult[0].data.ufsUrl,
      prompt,
      userId,
    },
  });
}

async function generatePollinationsImage(
  prompt: string,
  userId: string,
  aspectRatio: ImageAspectRatio,
) {
  const apiKey = process.env.POLLINATIONS_API_KEY?.trim();

  if (!apiKey) {
    return {
      success: false,
      error: "POLLINATIONS_API_KEY is not configured.",
    };
  }

  const size =
    aspectRatio === "16:9"
      ? "1024x576"
      : "1024x1024";

  const response = await fetch(
    "https://gen.pollinations.ai/v1/images/generations",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        model: "black-forest-labs/flux.1-schnell",
        size,
        response_format: "url",
        n: 1,
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Pollinations image generation failed: ${errorText}`,
    );
  }

  const result = await response.json();

  const imageUrl = result.data?.[0]?.url;

  if (!imageUrl) {
    throw new Error(
      "Pollinations did not return an image URL",
    );
  }

  const image = await persistGeneratedImage(
    imageUrl,
    prompt,
    userId,
    "pollinations",
  );

  return {
    success: true,
    image,
  };
}

export async function generateImageAction(
  prompt: string,
  _model: ImageModelList,
  aspectRatio: ImageAspectRatio = "16:9",
) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "You must be logged in to generate images",
    };
  }

  try {
    return await generatePollinationsImage(
      prompt,
      session.user.id,
      aspectRatio,
    );
  } catch (error) {
    console.error("Error generating image:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate image",
    };
  }
}