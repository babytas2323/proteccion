import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';

const DatabaseTest = () => {
  const [testResults, setTestResults] = useState({
    connection: 'pending',
    read: 'pending',
    write: 'pending',
    delete: 'pending'
  });
  const [testDocumentId, setTestDocumentId] = useState(null);
  const [accidentCount, setAccidentCount] = useState(null);
  const [error, setError] = useState(null);

  const runAllTests = async () => {
    // Reset results
    setTestResults({
      connection: 'pending',
      read: 'pending',
      write: 'pending',
      delete: 'pending'
    });
    setTestDocumentId(null);
    setAccidentCount(null);
    setError(null);

    try {
      // Test 1: Connection and basic read
      setTestResults(prev => ({ ...prev, connection: 'testing' }));
      const accidentsRef = collection(db, "accidents");
      const q = query(accidentsRef, orderBy("createdAt", "desc"), limit(1));
      const snapshot = await getDocs(q);
      setAccidentCount(snapshot.size);
      setTestResults(prev => ({ ...prev, connection: 'success', read: 'success' }));

      // Test 2: Write operation
      setTestResults(prev => ({ ...prev, write: 'testing' }));
      const testDoc = {
        test: true,
        createdAt: serverTimestamp(),
        timestamp: new Date().toISOString(),
        message: "Database connectivity test"
      };
      
      const docRef = await addDoc(collection(db, "test"), testDoc);
      setTestDocumentId(docRef.id);
      setTestResults(prev => ({ ...prev, write: 'success' }));

      // Test 3: Delete operation
      setTestResults(prev => ({ ...prev, delete: 'testing' }));
      await deleteDoc(doc(db, "test", docRef.id));
      setTestResults(prev => ({ ...prev, delete: 'success' }));

    } catch (err) {
      console.error('Database test error:', err);
      setError(err.message);
      
      // Update test results based on where the error occurred
      setTestResults(prev => ({
        connection: prev.connection === 'testing' ? 'failed' : prev.connection,
        read: prev.read === 'testing' ? 'failed' : prev.read,
        write: prev.write === 'testing' ? 'failed' : prev.write,
        delete: prev.delete === 'testing' ? 'failed' : prev.delete
      }));
    }
  };

  useEffect(() => {
    runAllTests();
  }, []);

  const getTestStatus = (status) => {
    switch (status) {
      case 'success': return { text: '✓ Success', color: 'green' };
      case 'failed': return { text: '✗ Failed', color: 'red' };
      case 'testing': return { text: '↻ Testing...', color: 'orange' };
      case 'pending': return { text: '- Pending', color: 'gray' };
      default: return { text: status, color: 'black' };
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      margin: '20px 0', 
      border: '2px solid #007bff', 
      borderRadius: '8px',
      backgroundColor: '#f8f9fa'
    }}>
      <h2 style={{ marginTop: 0, color: '#007bff' }}>Firestore Database Test</h2>
      
      <div style={{ marginBottom: '15px' }}>
        <h3>Test Results:</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          <div>
            <strong>Connection:</strong> 
            <span style={{ color: getTestStatus(testResults.connection).color, marginLeft: '8px' }}>
              {getTestStatus(testResults.connection).text}
            </span>
          </div>
          <div>
            <strong>Read Operation:</strong> 
            <span style={{ color: getTestStatus(testResults.read).color, marginLeft: '8px' }}>
              {getTestStatus(testResults.read).text}
            </span>
          </div>
          <div>
            <strong>Write Operation:</strong> 
            <span style={{ color: getTestStatus(testResults.write).color, marginLeft: '8px' }}>
              {getTestStatus(testResults.write).text}
            </span>
          </div>
          <div>
            <strong>Delete Operation:</strong> 
            <span style={{ color: getTestStatus(testResults.delete).color, marginLeft: '8px' }}>
              {getTestStatus(testResults.delete).text}
            </span>
          </div>
        </div>
      </div>

      {accidentCount !== null && (
        <div style={{ marginBottom: '15px' }}>
          <strong>Accident documents found:</strong> {accidentCount}
        </div>
      )}

      {testDocumentId && (
        <div style={{ marginBottom: '15px' }}>
          <strong>Test document ID:</strong> {testDocumentId} (automatically deleted)
        </div>
      )}

      {error && (
        <div style={{ 
          color: 'red', 
          backgroundColor: '#ffe6e6', 
          padding: '10px', 
          borderRadius: '5px',
          marginBottom: '15px'
        }}>
          <h3>Error Details:</h3>
          <p style={{ margin: '5px 0' }}><strong>Message:</strong> {error}</p>
          <p style={{ margin: '5px 0' }}>
            <strong>Tip:</strong> If you're getting permission errors, check your Firestore rules in the Firebase Console.
          </p>
        </div>
      )}

      <button 
        onClick={runAllTests}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Run Tests Again
      </button>

      <div style={{ 
        marginTop: '15px', 
        padding: '10px', 
        backgroundColor: '#e9ecef', 
        borderRadius: '5px',
        fontSize: '14px'
      }}>
        <h4 style={{ margin: '0 0 10px 0' }}>Firestore Rules Recommendation:</h4>
        <p>
          For public read access with authenticated writes, use these rules in your Firebase Console:
        </p>
        <pre style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '10px', 
          borderRadius: '3px',
          overflowX: 'auto',
          fontSize: '12px'
        }}>
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /accidents/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /test/{document} {
      allow read, write: if request.auth != null;
    }
  }
}`}
        </pre>
      </div>
    </div>
  );
};

export default DatabaseTest;