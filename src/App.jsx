import React, { useState, useEffect } from 'react';
import './App.css';
import { IoLogoYoutube } from "react-icons/io";
import { FaLinkedin } from "react-icons/fa6";
import { FaSquareInstagram } from "react-icons/fa6";
import { FaFacebook } from "react-icons/fa";
import { BsGlobe2 } from "react-icons/bs";
import { BsSendFill } from "react-icons/bs";




class LangflowClient {
  constructor(baseURL, applicationToken) {
    this.baseURL = baseURL;
    this.applicationToken = applicationToken;
  }

  async post(endpoint, body, headers = { "Content-Type": "application/json" }) {
  headers["Authorization"] = `Bearer ${this.applicationToken}`;
  headers["Content-Type"] = "application/json";
  const url = `${this.baseURL}${endpoint}`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    });

    const responseText = await response.text(); // Read raw text
    try {
      const responseMessage = JSON.parse(responseText); // Try to parse JSON
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText} - ${JSON.stringify(responseMessage)}`);
      }
      return responseMessage;
    } catch (jsonError) {
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText} - ${responseText}`);
      }
      throw new Error(`Unexpected response format: ${responseText}`);
    }
  } catch (error) {
    console.error('Request Error:', error.message);
    throw error;
  }
}


  async initiateSession(flowId, langflowId, inputValue, inputType = 'chat', outputType = 'chat', stream = false, tweaks = {}) {
    const endpoint = `/lf/${langflowId}/api/v1/run/${flowId}?stream=${stream}`;
    return this.post(endpoint, { input_value: inputValue, input_type: inputType, output_type: outputType, tweaks: tweaks });
  }

  handleStream(streamUrl, onUpdate, onClose, onError) {
    const eventSource = new EventSource(streamUrl);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onUpdate(data);
    };

    eventSource.onerror = (event) => {
      console.error('Stream Error:', event);
      onError(event);
      eventSource.close();
    };

    eventSource.addEventListener("close", () => {
      onClose('Stream closed');
      eventSource.close();
    });

    return eventSource;
  }

  async runFlow(flowIdOrName, langflowId, inputValue, inputType = 'chat', outputType = 'chat', tweaks = {}, stream = false, onUpdate, onClose, onError) {
    try {
      const initResponse = await this.initiateSession(flowIdOrName, langflowId, inputValue, inputType, outputType, stream, tweaks);
      console.log('Init Response:', initResponse);
      if (stream && initResponse && initResponse.outputs && initResponse.outputs[0].outputs[0].artifacts.stream_url) {
        const streamUrl = initResponse.outputs[0].outputs[0].artifacts.stream_url;
        console.log(`Streaming from: ${streamUrl}`);
        this.handleStream(streamUrl, onUpdate, onClose, onError);
      }
      return initResponse;
    } catch (error) {
      console.error('Error running flow:', error);
      onError('Error initiating session');
    }
  }
}

const App = () => {
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);
  const [streaming, setStreaming] = useState(false);

  const flowIdOrName = '49050ddb-5722-42ab-a20a-2e1b5511b1ea';
  const langflowId = 'f9d59779-d9a5-453a-ad47-78798017757a';
  const applicationToken = 'AstraCS:vZdJmcEixvvmZtjQnWWRSMmu:13bf5974794cdfe86a0f4e2e1414b66834e4c61e3bfb0fb4c8004b2149cd18fc';
  const langflowClient = new LangflowClient('/lf', applicationToken); // Use empty string as baseURL since Vite proxies requests

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    const tweaks = {
      "ChatInput-u5MzC": {},
      "ParseData-Ebz54": {},
      "Prompt-OBSy7": {},
      "SplitText-5G6vp": {},
      "ChatOutput-GWMGY": {},
      "AstraDB-ChmdT": {},
      "AstraDB-551UI": {},
      "File-4Y8jW": {},
      "Google Generative AI Embeddings-xg1y4": {},
      "Google Generative AI Embeddings-BLsut": {},
      "GoogleGenerativeAIModel-1SVCu": {}
    };

    try {
      const flowResponse = await langflowClient.runFlow(
        flowIdOrName,
        langflowId,
        inputValue,
        'chat', // default input type
        'chat', // default output type
        tweaks,
        streaming, // Streaming flag
        (data) => {
          console.log("Received:", data.chunk); // Handle streaming updates
        },
        (message) => {
          console.log("Stream Closed:", message); // Handle stream close
        },
        (err) => {
          setError("Stream Error: " + err); // Handle stream errors
        }
      );

      if (!streaming && flowResponse && flowResponse.outputs) {
        const flowOutputs = flowResponse.outputs[0];
        const firstComponentOutputs = flowOutputs.outputs[0];
        const output = firstComponentOutputs.outputs.message;
        setResponse(output.message.text);
      }
    } catch (error) {
      setError("Error running flow: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      {/* Hero-Section */}
  <div className="background">
    <div className="text-center lg:text-left">
      <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold px-4 md:px-16 py-8 text-slate-300">
        SOCIAL MEDIA <br />
        <span className="text-black text-3xl md:text-5xl lg:text-7xl flex justify-center lg:justify-start shadow-zinc-950 shadow-2xl ml-0 lg:ml-12">
          ANALYSIS
        </span>
      </h1>
      <p className="mx-4 md:mx-16 lg:mx-24 mt-4 lg:mt-8 text-slate-200 text-sm md:text-md lg:text-lg italic">
      A Social Media Analysis Report transforms <br /> raw data into actionable insights, revealing <br /> the story behind audience <br /> interactions and content performance.
      </p>
      <button className="mx-4 md:mx-16 lg:mx-24 mt-4 text-black bg-slate-400 px-6 lg:px-8 py-2 font-medium rounded border" onClick={() => document.getElementById("downSection").scrollIntoView({ behavior: 'smooth' })}
      >
        Check Analysis
      </button>
      <div className="flex flex-wrap gap-4 md:gap-6 bg-white w-full md:w-[600px] mt-8 lg:mt-12 rounded py-4 px-4 justify-center md:justify-start shadow-zinc-950 shadow-2xl">
        <div className="flex gap-2 text-lg md:text-xl font-bold">
          <IoLogoYoutube className="text-2xl md:text-3xl" />
          Youtube
        </div>
        <div className="flex gap-2 text-lg md:text-xl font-bold">
          <FaLinkedin className="text-2xl md:text-3xl" />
          LinkedIn
        </div>
        <div className="flex gap-2 text-lg md:text-xl font-bold">
          <FaSquareInstagram className="text-2xl md:text-3xl" />
          Instagram
        </div>
        <div className="flex gap-2 text-lg md:text-xl font-bold">
          <FaFacebook className="text-2xl md:text-3xl" />
          Facebook
        </div>
      </div>
    </div>
    <div className="background-img flex justify-center lg:justify-end">
      <img
        src="pic-removebg-preview.png"
        className="w-[300px] h-[250px] md:w-[450px] md:h-[350px] lg:w-[600px] lg:h-[450px] rounded"
      />
    </div>
  </div>






  {/* Middle-section */}
  <div className="sm:px-6 md:px-10 lg:px-24 flex flex-wrap gap-4 md:gap-8 my-12 lg:my-52 justify-center">
    <div className="bg-gray-500 rounded-xl w-full md:w-[300px]">
      <h2 className="flex text-2xl md:text-3xl font-bold text-white m-4">
        <BsGlobe2 />
        &nbsp;Reels
      </h2>
      <p className="p-4 text-white text-sm md:text-base">
      Short, engaging videos designed to capture attention quickly and boost reach through dynamic storytelling.
      </p>
      <button className="ml-4 mb-4 mt-4 text-black bg-slate-200 px-6 md:px-8 py-2 font-medium rounded border">
        View More
      </button>
    </div>

    <div className="bg-gray-400 rounded-xl w-full md:w-[300px]">
      <h2 className="flex text-2xl md:text-3xl font-bold text-white m-4">
        <BsGlobe2 />
        &nbsp;Carousal Post
      </h2>
      <p className="p-4 text-white text-sm md:text-base">
      Multi-image or video posts that allow for detailed storytelling or showcasing multiple facets of a topic.
      </p>
      <button className="ml-4 mb-4 mt-4 text-white bg-slate-800 px-6 md:px-8 py-2 font-medium rounded border">
        View More
      </button>
    </div>

    <div className="bg-gray-300 rounded-xl w-full md:w-[300px]">
      <h2 className="flex text-2xl md:text-3xl font-bold text-white m-4">
        <BsGlobe2 />
        &nbsp;Static Post
      </h2>
      <p className="p-4 text-white text-sm md:text-base">
      Single-image posts that convey a focused message or visual, ideal for brand highlights or announcements.
      </p>
      <button className="ml-4 mb-4 mt-4 bg-slate-800 px-6 md:px-8 py-2 font-medium rounded border text-white">
        View More
      </button>
    </div>
  </div>






{/* Analysis Report Section */}
  <div className="sm:px-6 md:px-10 lg:px-24 flex flex-wrap lg:flex-nowrap gap-8 my-12 lg:my-52" id='downSection'>
    <div className="w-full lg:w-[50%]">
      <img
        src="https://marktvizier.nl/wp-content/uploads/2021/11/posten-social-media-scaled.jpg"
        className="h-[200px] md:h-[300px] lg:h-[400px] rounded-2xl w-full object-cover"
      />
    </div>
    <div className="ml-0 lg:ml-8 w-full lg:w-[50%]">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center lg:text-left">
        SOCIAL <span className="text-gray-400"> MEDIA</span> <br />
        <span className="text-gray-400"> ANALYSIS</span> REPORT <br /> FORM
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col mt-8 gap-4">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message"
          className="w-full border-black border-2 p-2 rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-gray-200 px-4 py-2 rounded hover:shadow-gray-400 shadow-md text-center"
        >
          {loading ? "Loading..." : "Generate"}
        </button>
      </form>
      {error ? (
        <p className="text-red-500 mt-4">Error: {error}</p>
      ) : response ? (
        <div className="mt-8 bg-gray-200 rounded-2xl p-4 hover:shadow-gray-400 shadow-lg">
          <h2 className="text-2xl font-bold">Analysis Report:</h2>
          <p className="text-gray-700 text-lg font-medium">{response}</p>
        </div>
      ) : null}
    </div>
  </div>
</div>

  );
};

export default App;
