# Multi-Agent Information Search App
***
This project is a Full Stack Multi-Agent Application that allows users to search for blog articles and YouTube video interviews related to selected technologies and business areas. For example, you can search for YouTube video interviews and blog posts about Generative AI in the Customer Service industry.

The application is built using:

- Frontend: Next.js (React, JavaScript)
- Backend: Flask (Python)
- Multi-Agent System: CrewAI (LangChain)


**Features**
- Search for Blog Articles: Retrieve relevant blog posts about the selected technology and business areas.
- Search for YouTube Interviews: Find video interviews on YouTube based on the technology and business area selected.
- Technologies & Business Areas: Allows users to specify both technology and business area for a more focused search.
- CrewAI Integration: Powered by the multi-agent system CrewAI (LangChain), which fetches information based on user input.
- Next.js Frontend: Provides a fast, interactive, and user-friendly interface.
- Flask Backend: Facilitates communication between the frontend and the multi-agent system.


**Project Structure**
The project is structured into different components for ease of development and debugging:

**Frontend**:

Built with Next.js.
Provides the interface for users to input their technology and business area search terms.
Communicates with the Flask backend through API requests.

**Backend**:

Built with Flask.
Handles API requests from the frontend and forwards search queries to the multi-agent system.
Processes and formats the search results for display in the frontend.

**CrewAI (LangChain)**:

Multi-agent system that performs the actual search and aggregation of data.
Communicates with external APIs (e.g., YouTube, blog sources) to gather relevant articles and video interviews.
