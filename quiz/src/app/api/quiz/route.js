import { NextResponse } from "next/server";
import { docClient } from "@/lib/dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

export async function POST(request) {
  try {
    // 1. Get the dynamic quiz data from the frontend
    const reqBody = await request.json();
    console.log("Data received from frontend:", reqBody);

    // 2. Prepare the item to be saved
    // We use the spread operator (...) so whatever fields the frontend sends 
    // (title, category, questions array, etc.) get saved directly to the DB.
    const newQuiz = {
      ...reqBody, 
      createdAt: new Date().toISOString(), // Automatically add a timestamp
    };

    // 3. Save to DynamoDB
    const command = new PutCommand({
      TableName: "Quizzes",
      Item: newQuiz,
    });

    await docClient.send(command);

    // 4. Return success response
    return NextResponse.json(
      { 
        message: "Quiz created successfully!", 
        success: true, 
        quiz: newQuiz 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving quiz:", error);
    return NextResponse.json(
      { error: "Failed to save quiz", details: error.message },
      { status: 500 }
    );
  }
}