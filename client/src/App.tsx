import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

interface EmailResult {
  email: string;
  success: boolean;
  error?: string;
}

interface SendEmailResponse {
  success: boolean;
  message: string;
  results?: EmailResult[];
  summary?: {
    total: number;
    sent: number;
    failed: number;
  };
  error?: string;
}

const App: React.FC = () => {
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    message: '',
    isHtml: false
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SendEmailResponse | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [extractionSuccess, setExtractionSuccess] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const parseEmails = (emailString: string): string[] => {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    
    // First try to extract emails using regex (handles numbered format)
    const regexMatches = emailString.match(emailRegex);
    if (regexMatches && regexMatches.length > 0) {
      return removeDuplicates(regexMatches);
    }
    
    // Fallback to original parsing for comma/semicolon separated emails
    return emailString
      .split(/[,;\n]/)
      .map(email => email.trim())
      .filter(email => email.length > 0 && emailRegex.test(email));
  };

  const removeDuplicates = (emails: string[]): string[] => {
    return emails.filter((email, index) => emails.indexOf(email) === index);
  };

  const extractEmailsFromJson = (jsonString: string): string[] => {
    const emails: string[] = [];
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    
    try {
      // First try to parse as JSON
      const parsed = JSON.parse(jsonString);
      
      // Convert the entire JSON object to string and extract emails
      const jsonStr = JSON.stringify(parsed);
      const matches = jsonStr.match(emailRegex);
      
      if (matches) {
        emails.push.apply(emails, matches);
      }
      
      // Also try to extract from specific common fields
      const extractFromObject = (obj: any, path: string = ''): void => {
        if (typeof obj === 'string' && emailRegex.test(obj)) {
          const emailMatches = obj.match(emailRegex);
          if (emailMatches) {
            emails.push.apply(emails, emailMatches);
          }
        } else if (Array.isArray(obj)) {
          obj.forEach((item, index) => extractFromObject(item, `${path}[${index}]`));
        } else if (obj && typeof obj === 'object') {
          Object.keys(obj).forEach(key => {
            // Common email field names
            if (['email', 'mail', 'e-mail', 'emailAddress', 'email_address'].includes(key.toLowerCase())) {
              if (typeof obj[key] === 'string' && emailRegex.test(obj[key])) {
                emails.push(obj[key]);
              }
            }
            extractFromObject(obj[key], `${path}.${key}`);
          });
        }
      };
      
      extractFromObject(parsed);
      
    } catch (error) {
      // If JSON parsing fails, try to extract emails from raw text
      const matches = jsonString.match(emailRegex);
      if (matches) {
        emails.push.apply(emails, matches);
      }
    }
    
    // Remove duplicates and return
    return removeDuplicates(emails);
  };

  const handleJsonExtraction = () => {
    if (!jsonInput.trim()) {
      setExtractionSuccess('Please paste JSON content first');
      return;
    }

    try {
      const extractedEmails = extractEmailsFromJson(jsonInput);
      
      if (extractedEmails.length === 0) {
        setExtractionSuccess('No email addresses found in the JSON content');
        return;
      }

      // Add to existing emails or replace
      const existingEmails = formData.to ? parseEmails(formData.to) : [];
      const combinedEmails = existingEmails.concat(extractedEmails);
      const allEmails = removeDuplicates(combinedEmails);
      
      // Format emails with count and numbering
      const emailCount = `Total Emails: ${allEmails.length}\n\n`;
      const numberedEmails = allEmails.map((email, index) => `${index + 1}. ${email}`).join('\n');
      const formattedEmails = emailCount + numberedEmails;
      
      setFormData(prev => ({
        ...prev,
        to: formattedEmails
      }));

      // Show success message
      setExtractionSuccess(`Successfully extracted ${extractedEmails.length} email addresses!`);
      
      // Auto-close modal after 2 seconds
      setTimeout(() => {
        setShowJsonModal(false);
        setJsonInput('');
        setExtractionSuccess(null);
      }, 2000);
      
    } catch (error) {
      setExtractionSuccess('Error processing JSON content. Please check the format.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResults(null);

    try {
      const emails = parseEmails(formData.to);
      
      if (emails.length === 0) {
        setResults({
          success: false,
          message: 'Please enter at least one email address',
          error: 'No valid email addresses found'
        });
        setLoading(false); // Fix: Reset loading state before returning
        return;
      }

      console.log('Sending emails to:', emails); // Debug log
      console.log('Request data:', {
        to: emails,
        subject: formData.subject,
        message: formData.message,
        isHtml: formData.isHtml
      });

      const response = await axios.post<SendEmailResponse>('/api/send-bulk-email', {
        to: emails,
        subject: formData.subject,
        message: formData.message,
        isHtml: formData.isHtml
      });

      console.log('Response received:', response.data); // Debug log
      setResults(response.data);
    } catch (error) {
      console.error('Error sending emails:', error);
      setResults({
        success: false,
        message: 'Failed to send emails',
        error: axios.isAxiosError(error) 
          ? error.response?.data?.error || error.message 
          : 'Unknown error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    setTestLoading(true);
    try {
      console.log('Sending test email...'); // Debug log
      const response = await axios.post('/api/test-email');
      console.log('Test email response:', response.data); // Debug log
      alert('Test email sent successfully!');
    } catch (error) {
      console.error('Test email failed:', error);
      alert('Test email failed. Please check your configuration.');
    } finally {
      setTestLoading(false);
    }
  };

  const clearForm = () => {
    setFormData({
      to: '',
      subject: '',
      message: '',
      isHtml: false
    });
    setResults(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>📧 Bulk Email Sender</h1>
        <p>Send emails to multiple recipients at once</p>
      </header>

      <main className="App-main">
        <div className="email-form-container">
          <form onSubmit={handleSubmit} className="email-form">
            <div className="form-group">
              <div className="recipients-header">
                <label htmlFor="to">
                  Recipients (separate multiple emails with commas, semicolons, or new lines):
                </label>
                <button 
                  type="button" 
                  onClick={() => setShowJsonModal(true)}
                  className="json-extract-button"
                >
                  📄 Extract from JSON
                </button>
              </div>
              <textarea
                id="to"
                name="to"
                value={formData.to}
                onChange={handleInputChange}
                placeholder="example1@email.com, example2@email.com&#10;example3@email.com"
                rows={4}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject:</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="Enter email subject"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message:</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Enter your email message"
                rows={8}
                required
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="isHtml"
                  checked={formData.isHtml}
                  onChange={handleInputChange}
                />
                Send as HTML
              </label>
            </div>

            <div className="button-group">
              <button 
                type="submit" 
                disabled={loading}
                className="send-button"
              >
                {loading ? 'Sending...' : 'Send Bulk Email'}
              </button>
              
              <button 
                type="button" 
                onClick={handleTestEmail}
                disabled={testLoading}
                className="test-button"
              >
                {testLoading ? 'Testing...' : 'Send Test Email'}
              </button>
              
              <button 
                type="button" 
                onClick={clearForm}
                className="clear-button"
              >
                Clear Form
              </button>
            </div>
          </form>
        </div>

        {/* JSON Extraction Modal */}
        {showJsonModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>📄 Extract Emails from JSON</h3>
                <button 
                  className="modal-close"
                  onClick={() => setShowJsonModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className="modal-body">
                {extractionSuccess ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    background: extractionSuccess.includes('Successfully') ? '#f0f8e8' : '#fdf2f2',
                    border: `1px solid ${extractionSuccess.includes('Successfully') ? '#d4e8c3' : '#f5c6cb'}`,
                    borderRadius: '8px',
                    color: extractionSuccess.includes('Successfully') ? '#2d5016' : '#721c24'
                  }}>
                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem' }}>
                      {extractionSuccess.includes('Successfully') ? '✅' : '❌'} {extractionSuccess}
                    </h4>
                    {extractionSuccess.includes('Successfully') && (
                      <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>
                        Modal will close automatically...
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    <p>Paste your JSON content below. The system will automatically extract all email addresses:</p>
                    <textarea
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                      placeholder={`Example JSON formats:
{
  "users": [
    {"email": "user1@example.com", "name": "John"},
    {"email": "user2@example.com", "name": "Jane"}
  ]
}

or

[
  "email1@example.com",
  "email2@example.com"
]

or any JSON containing email addresses...`}
                      rows={12}
                      className="json-input"
                    />
                  </>
                )}
              </div>
              {!extractionSuccess && (
                <div className="modal-footer">
                  <button
                    onClick={handleJsonExtraction}
                    className="extract-button"
                    disabled={!jsonInput.trim()}
                  >
                    Extract Emails
                  </button>
                  <button
                    onClick={() => {
                      setShowJsonModal(false);
                      setJsonInput('');
                      setExtractionSuccess(null);
                    }}
                    className="cancel-button"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {results && (
          <div className="results-container">
            <h3>Email Sending Results</h3>
            <div className={`result-summary ${results.success ? 'success' : 'error'}`}>
              <p>{results.message}</p>
              {results.summary && (
                <div className="summary-stats">
                  <span>Total: {results.summary.total}</span>
                  <span>Sent: {results.summary.sent}</span>
                  <span>Failed: {results.summary.failed}</span>
                </div>
              )}
            </div>

            {results.results && results.results.length > 0 && (
              <div className="detailed-results">
                <h4>Detailed Results:</h4>
                <div className="results-list">
                  {results.results.map((result, index) => (
                    <div 
                      key={index} 
                      className={`result-item ${result.success ? 'success' : 'error'}`}
                    >
                      <span className="email">{result.email}</span>
                      <span className="status">
                        {result.success ? '✅ Sent' : '❌ Failed'}
                      </span>
                      {result.error && (
                        <span className="error-message">{result.error}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="App-footer">
        <p>Powered by Nodemailer & React</p>
      </footer>
    </div>
  );
};

export default App;