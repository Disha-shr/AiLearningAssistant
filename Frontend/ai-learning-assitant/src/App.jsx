import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import NotFoundPage from './pages/Quizzes/NotFoundPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardPage from './pages/Dashboard/DashboardPage';
import DocumentsListPage from './pages/Documents/DocumentsListPage';
import DocumentsDetailPage from './pages/Documents/DocumentsDetailsPage';
import FlashcardPage from './pages/Flashcards/FlashcardsPage';
import FlashcardsListPage from './pages/Flashcards/FlashcardsListPage';
import QuizTakePage from './pages/Quizzes/QuizTakePage';
import QuizResultPage from './pages/Quizzes/QuizResultPage';
import ProfilePage from './pages/Profile/ProfilePage';


const App = () =>{
  const {isAuthenticated, loading} = useAuth()
 if(loading) {
  return (
    <div className="flex items-center justify-center h-screen">
    <p>Loading...</p>
    </div>
  );
 }

 return (
  <Router>
    <Routes>
      <Route
      path="/" 
      element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace/>}
      />
      <Route path="/login" element={<LoginPage/>}/>
      <Route path="/register" element={<RegisterPage/>}/>

      {/*Protected Routes */}
      <Route element={< ProtectedRoute />}>
      <Route path="/dashboard" element={<DashboardPage />}/>
      <Route path="/documents" element={<DocumentsListPage />} />
      <Route path="/documents/:id" element={<DocumentsDetailPage />} />
      <Route path="/flashcards" element={<FlashcardsListPage />} />
      <Route path="/documents/:id/flashcards" element={<FlashcardPage />} />
      <Route path="/quizzes/:quizId" element={<QuizTakePage />} />
      <Route path="/quizzes/:quizId/results" element={<QuizResultPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<NotFoundPage/>}/>
      </Routes>
  </Router>
 );
}

export default App