"use client";
import { useEffect, useState } from "react";
import axios from "axios";
export default function Home() {
  const [quizData, setQuizData] = useState(null);
  
  
    const fetchQuizData = async () => {
      try {
        const response = await axios.post("/api/quiz");
        const data = await response.data;
        setQuizData(data.quiz);
        console.log("Quiz data fetched successfully:", data);
      }
      catch (error) {
        console.error("Error fetching quiz data:", error);
      }
    };

    



  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <button className="text-blue-900 hover:text-blue-700 " onClick={fetchQuizData}>
        Welcome to the Quiz App
      </button>
    </div>
  );
}
