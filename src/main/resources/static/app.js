const { useState, useRef, useEffect } = React;

// --- INVOICE EXTRACTOR APP ---
function ExtractorApp() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [form, setForm] = useState({
        invoiceNumber: '',
        vendorName: '',
        gstNumber: '',
        totalAmount: '',
        gstAmount: '',
        invoiceDate: ''
    });

    // Drag & Drop specific state
    const [dragActive, setDragActive] = useState(false);

    const handleFileChange = (fileToUpload) => {
        if (fileToUpload) {
            setFile(fileToUpload);
            setError(null);
        }
    };

    // Drag and drop handlers
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setError("Please select a file to upload.");
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/invoice/extract", {
                method: "POST",
                body: formData
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to extract invoice");
            }

            const data = await res.json();

            setForm({
                invoiceNumber: data.invoiceNumber || '',
                vendorName: data.vendorName || '',
                gstNumber: data.gstNumber || '',
                totalAmount: data.totalAmount || '',
                gstAmount: data.gstAmount || '',
                invoiceDate: data.invoiceDate || ''
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-4xl mx-auto w-full border border-gray-100 dark:border-gray-700 transition-colors">

            {/* Upgraded Upload Section */}
            <div className="bg-gradient-to-r from-brand-500 to-purple-500 p-8 rounded-xl text-white mb-8 shadow-lg">
                <h3 className="text-2xl font-bold mb-2">Upload Invoice</h3>
                <p className="text-brand-100 mb-6 font-medium">Extract structured data from any PDF or Image instantly.</p>

                <form onSubmit={handleUpload}>
                    <div
                        className={`file-upload-area relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300
                                    ${dragActive ? 'border-white bg-white/20 scale-[1.02]' : 'border-brand-200 bg-white/10 hover:bg-white/20'}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => handleFileChange(e.target.files[0])}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center justify-center pointer-events-none">
                            <svg className="w-12 h-12 mb-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                            <p className="text-lg font-semibold">{file ? file.name : "Drag & Drop your file here"}</p>
                            <p className="text-sm opacity-75 mt-2">{file ? "Click to change file" : "or click to browse from your computer"}</p>
                        </div>
                    </div>

                    {error && <p className="text-red-200 text-sm mt-4 font-medium">{error}</p>}

                    <div className="mt-6 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading || !file}
                            className={`px-8 py-3 rounded-xl font-bold tracking-wide transition-all shadow-md
                                    ${loading || !file
                                        ? 'bg-white/30 text-white/50 cursor-not-allowed'
                                        : 'bg-white text-brand-600 hover:bg-gray-50 hover:shadow-xl hover:-translate-y-1'}`}
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Processing Document...
                                </span>
                            ) : 'Extract Data'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Form Area with Empty State */}
            <div>
                <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-100 flex items-center border-b dark:border-gray-700 pb-4">
                    <svg className="w-6 h-6 mr-3 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Extraction Results
                </h3>

                {!form.invoiceNumber && !form.vendorName ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                        <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                        <p className="text-lg font-medium">No data extracted yet</p>
                        <p className="text-sm mt-1 max-w-xs text-center">Upload an invoice above to see the AI magic happen.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-900/50 p-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-inner">

                        {/* Input Fields (Same as before but with updated styling) */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Invoice Number</label>
                            <input type="text" name="invoiceNumber" value={form.invoiceNumber} onChange={handleInputChange} className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm p-3 border focus:border-brand-500 focus:ring-brand-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-shadow group-hover:shadow-md" />
                        </div>

                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Vendor Name</label>
                            <input type="text" name="vendorName" value={form.vendorName} onChange={handleInputChange} className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm p-3 border focus:border-brand-500 focus:ring-brand-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-shadow group-hover:shadow-md" />
                        </div>

                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">GST Number</label>
                            <input type="text" name="gstNumber" value={form.gstNumber} onChange={handleInputChange} className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm p-3 border focus:border-brand-500 focus:ring-brand-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-shadow group-hover:shadow-md" />
                        </div>

                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Invoice Date</label>
                            <input type="text" name="invoiceDate" value={form.invoiceDate} onChange={handleInputChange} className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm p-3 border focus:border-brand-500 focus:ring-brand-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-shadow group-hover:shadow-md" />
                        </div>

                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Total Amount</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 dark:text-gray-400 font-medium">$</span>
                                <input type="number" name="totalAmount" value={form.totalAmount} onChange={handleInputChange} className="mt-1 block w-full pl-8 rounded-lg border-gray-300 dark:border-gray-600 shadow-sm p-3 border focus:border-brand-500 focus:ring-brand-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-lg transition-shadow group-hover:shadow-md" />
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">GST Amount</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 dark:text-gray-400 font-medium">$</span>
                                <input type="number" name="gstAmount" value={form.gstAmount} onChange={handleInputChange} className="mt-1 block w-full pl-8 rounded-lg border-gray-300 dark:border-gray-600 shadow-sm p-3 border focus:border-brand-500 focus:ring-brand-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-lg transition-shadow group-hover:shadow-md" />
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}

// --- DOCUMENT CHAT APP (V2) ---
function ChatApp() {
    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState("");
    const [asking, setAsking] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showSessions, setShowSessions] = useState(true);
    const chatEndRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchSessions();
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, asking]);

    const fetchSessions = async () => {
        try {
            const res = await fetch("/api/v2/chat/sessions");
            if (res.ok) {
                const data = await res.json();
                setSessions(data);
                if (data.length > 0 && !currentSessionId) {
                    loadSession(data[0].id);
                } else if (data.length === 0) {
                    createNewSession();
                }
            }
        } catch (err) {
            console.error("Failed to fetch sessions", err);
        }
    };

    const createNewSession = async () => {
        try {
            const res = await fetch("/api/v2/chat/sessions?title=New+Chat", { method: "POST" });
            if (res.ok) {
                const data = await res.json();
                setSessions(prev => [data, ...prev]);
                loadSession(data.id);
            }
        } catch (err) {
            console.error("Failed to create session", err);
        }
    };

    const loadSession = async (id) => {
        setCurrentSessionId(id);
        setMessages([]);
        try {
            const res = await fetch(`/api/v2/chat/sessions/${id}`);
            if (res.ok) {
                const data = await res.json();
                const formatted = data.messages.map(m => ({
                    role: m.role === 'USER' ? 'user' : 'bot',
                    text: m.content
                }));
                setMessages(formatted);
            }
        } catch (err) {
            console.error("Failed to load session", err);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !currentSessionId) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`/api/v2/chat/sessions/${currentSessionId}/upload`, {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                setMessages(prev => [...prev, { role: 'bot', text: `Document '${file.name}' indexed into Vector Store successfully! Ask me anything.` }]);
            } else {
                setMessages(prev => [...prev, { role: 'bot', text: `Upload failed: ${data.error}` }]);
            }
        } catch (err) {
            setMessages(prev => [...prev, { role: 'bot', text: `Upload error: ${err.message}` }]);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!currentMessage.trim() || !currentSessionId) return;

        const userMsg = currentMessage;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setCurrentMessage("");
        setAsking(true);

        try {
            const res = await fetch(`/api/v2/chat/sessions/${currentSessionId}/ask`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: userMsg })
            });
            const data = await res.json();

            if (res.ok) {
                setMessages(prev => [...prev, { role: 'bot', text: data.answer }]);
            } else {
                setMessages(prev => [...prev, { role: 'bot', text: `Error: ${data.error}` }]);
            }
        } catch (err) {
            setMessages(prev => [...prev, { role: 'bot', text: `Failed to get answer: ${err.message}` }]);
        } finally {
            setAsking(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 flex w-full max-w-6xl mx-auto h-[80vh] overflow-hidden transition-colors relative">
            
            {/* Left Sidebar: Sessions List */}
            <div className={`${showSessions ? 'w-64 border-r' : 'w-0 overflow-hidden'} flex-shrink-0 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300`}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <button onClick={createNewSession} className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        New Chat
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto p-2 space-y-1">
                    {sessions.map(s => (
                        <button 
                            key={s.id} 
                            onClick={() => loadSession(s.id)}
                            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors truncate ${currentSessionId === s.id ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                        >
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                                Chat #{s.id}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-grow flex flex-col h-full bg-white dark:bg-gray-800 relative">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center shadow-sm z-10">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setShowSessions(!showSessions)} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        </button>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                            Document Chat 
                            <span className="ml-2 px-2.5 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 text-xs tracking-wider border border-brand-200 dark:border-brand-800">
                                GPT RAG Enabled
                            </span>
                        </h2>
                    </div>
                    
                    <div>
                        <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="application/pdf,image/*" />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={!currentSessionId || uploading}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border transition-all 
                                ${!currentSessionId || uploading ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200 text-gray-500' : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 bg-white dark:bg-gray-800'}`}
                        >
                            {uploading ? (
                                <svg className="animate-spin h-4 w-4 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            ) : (
                                <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                            )}
                            {uploading ? 'Parsing...' : 'Upload Doc'}
                        </button>
                    </div>
                </div>

                {/* Chat History */}
                <div className="flex-grow overflow-y-auto p-6 bg-gray-50/50 dark:bg-gray-900/30">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
                            <div className="w-20 h-20 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center mb-6 shadow-sm border border-brand-200 dark:border-brand-800">
                                <svg className="w-10 h-10 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">New Chat Session</h3>
                            <p className="text-gray-500 dark:text-gray-400">Click <b>Upload Doc</b> securely index your documents into the Vector Store, then ask questions about them!</p>
                        </div>
                    ) : (
                        <div className="max-w-3xl mx-auto space-y-6">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`message flex flex-col shadow-sm ${msg.role === 'user' ? 'user-message' : 'bot-message border border-gray-200 dark:border-gray-700'}`}>
                                    <span className="text-xs font-bold opacity-75 mb-1.5 tracking-wider">{msg.role === 'user' ? 'You' : 'AI Assistant'}</span>
                                    <span className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed">{msg.text}</span>
                                </div>
                            ))}
                            {asking && (
                                <div className="message bot-message shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
                                    <span className="text-xs font-bold opacity-75 mb-2 tracking-wider">AI Assistant</span>
                                    <div className="flex space-x-1.5 py-2">
                                        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
                                        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{animationDelay: "0.4s"}}></div>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>
                    )}
                </div>

                {/* Message Input Container */}
                <div className="bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700 z-10 w-full relative">
                    <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative flex">
                        <input
                            type="text"
                            value={currentMessage}
                            onChange={(e) => setCurrentMessage(e.target.value)}
                            disabled={!currentSessionId || asking}
                            placeholder="Message Document AI... (RAG enabled)"
                            className="w-full rounded-xl border border-gray-300 dark:border-gray-600 focus:border-brand-500 focus:ring-brand-500 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 pr-16 text-[15px]"
                        />
                        <button
                            type="submit"
                            disabled={!currentSessionId || asking || !currentMessage.trim()}
                            className={`absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center rounded-lg transition-colors
                                ${!currentSessionId || asking || !currentMessage.trim() ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700 text-white shadow-md'}`}
                        >
                            <svg className="w-5 h-5 -ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
                        </button>
                    </form>
                    <div className="text-center mt-2">
                        <span className="text-[11px] text-gray-400">Powered by Spring AI, PGVector, and local transformer models. Answers may be hallucinated.</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Render both apps
const extractorRoot = ReactDOM.createRoot(document.getElementById('extractor-root'));
extractorRoot.render(<ExtractorApp />);

const chatRoot = ReactDOM.createRoot(document.getElementById('chat-root'));
chatRoot.render(<ChatApp />);

// Sidebar toggle logic
const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('main-content');
const toggleBtn = document.getElementById('sidebar-toggle');

const navExtractor = document.getElementById('nav-extractor');
const navChat = document.getElementById('nav-chat');

const extractorContainer = document.getElementById('extractor-root');
const chatContainer = document.getElementById('chat-root');

if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('closed');
        mainContent.classList.toggle('expanded');
    });
}

if (navExtractor) {
    navExtractor.addEventListener('click', (e) => {
        e.preventDefault();
        navExtractor.classList.add('active');
        navChat.classList.remove('active');

        extractorContainer.classList.remove('hidden');
        extractorContainer.classList.add('flex');
        chatContainer.classList.add('hidden');
        chatContainer.classList.remove('flex');
    });
}

if (navChat) {
    navChat.addEventListener('click', (e) => {
        e.preventDefault();
        navChat.classList.add('active');
        navExtractor.classList.remove('active');

        chatContainer.classList.remove('hidden');
        chatContainer.classList.add('flex');
        extractorContainer.classList.add('hidden');
        extractorContainer.classList.remove('flex');
    });
}
