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

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError(null);
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
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-4xl mx-auto border border-gray-100">
            <h2 className="text-3xl font-bold mb-6 text-indigo-600">Smart Invoice Extractor</h2>

            <form onSubmit={handleUpload} className="mb-8 border-b pb-8">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload Invoice (Image or PDF)</label>
                    <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                </div>

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <button
                    type="submit"
                    disabled={loading || !file}
                    className={`px-6 py-2 rounded-lg text-white font-semibold transition-colors shadow-sm
                            ${loading || !file ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                >
                    {loading ? 'Processing Document...' : 'Extract Data'}
                </button>
            </form>

            <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Extracted Invoice Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg border border-gray-200">

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Invoice Number</label>
                        <input
                            type="text"
                            name="invoiceNumber"
                            value={form.invoiceNumber}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2.5 border focus:border-indigo-500 focus:ring-indigo-500 bg-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Vendor Name</label>
                        <input
                            type="text"
                            name="vendorName"
                            value={form.vendorName}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2.5 border focus:border-indigo-500 focus:ring-indigo-500 bg-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">GST Number</label>
                        <input
                            type="text"
                            name="gstNumber"
                            value={form.gstNumber}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2.5 border focus:border-indigo-500 focus:ring-indigo-500 bg-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Invoice Date</label>
                        <input
                            type="text"
                            name="invoiceDate"
                            value={form.invoiceDate}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2.5 border focus:border-indigo-500 focus:ring-indigo-500 bg-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                        <input
                            type="number"
                            name="totalAmount"
                            value={form.totalAmount}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2.5 border focus:border-indigo-500 focus:ring-indigo-500 bg-white font-mono"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">GST Amount</label>
                        <input
                            type="number"
                            name="gstAmount"
                            value={form.gstAmount}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2.5 border focus:border-indigo-500 focus:ring-indigo-500 bg-white font-mono"
                        />
                    </div>

                </div>
            </div>
        </div>
    );
}

// --- DOCUMENT CHAT APP ---
function ChatApp() {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [context, setContext] = useState("");
    const [messages, setMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState("");
    const [asking, setAsking] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files));
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (files.length === 0) return;

        setUploading(true);
        const formData = new FormData();
        files.forEach(file => formData.append("files", file));

        try {
            const res = await fetch("/api/chat/upload", {
                method: "POST",
                body: formData
            });
            const data = await res.json();

            if (res.ok) {
                setContext(data.context);
                setMessages([{ role: 'bot', text: `Successfully processed ${files.length} document(s). I've read them carefully. What would you like to know?` }]);
            } else {
                setMessages([{ role: 'bot', text: `Error: ${data.error}` }]);
            }
        } catch (err) {
            setMessages([{ role: 'bot', text: `Upload failed: ${err.message}` }]);
        } finally {
            setUploading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!currentMessage.trim() || !context) return;

        const userMsg = currentMessage;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setCurrentMessage("");
        setAsking(true);

        try {
            const res = await fetch("/api/chat/ask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ context, question: userMsg })
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
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-4xl mx-auto border border-gray-100 flex flex-col h-[85vh]">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-3xl font-bold text-indigo-600">Chat with Documents</h2>
                <div className="flex items-center text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                    AI Powered
                </div>
            </div>

            {/* Upload Section */}
            <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100 mb-6 shadow-sm">
                <form onSubmit={handleUpload} className="flex items-end gap-4">
                    <div className="flex-grow">
                        <label className="block text-sm font-medium text-indigo-900 mb-2">Select Documents (Images/PDFs)</label>
                        <input
                            type="file"
                            multiple
                            accept="image/*,application/pdf"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-white file:text-indigo-700 hover:file:bg-gray-50 bg-white rounded-md border border-indigo-200"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={uploading || files.length === 0}
                        className={`px-6 py-2.5 rounded-md text-white font-semibold whitespace-nowrap shadow-sm transition-colors ${uploading || files.length === 0 ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                        {uploading ? 'Processing...' : 'Upload & Read'}
                    </button>
                </form>
                {context && <p className="text-green-600 text-sm mt-3 font-medium flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    Documents loaded into AI context.
                </p>}
            </div>

            {/* Chat Section */}
            <div className="flex-grow flex flex-col bg-white rounded-lg p-4 mb-4 chat-container border border-gray-200 shadow-inner">
                {messages.length === 0 ? (
                    <div className="m-auto text-gray-400 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-600 mb-1">No messages yet</h3>
                        <p className="text-sm">Upload documents above to start your conversation.</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div key={idx} className={`message flex flex-col ${msg.role === 'user' ? 'user-message shadow-sm' : 'bot-message shadow-sm border border-gray-100'}`}>
                            <span className="text-xs font-bold opacity-60 mb-1 uppercase tracking-wider">{msg.role === 'user' ? 'You' : 'AI Assistant'}</span>
                            <span className="whitespace-pre-wrap leading-relaxed">{msg.text}</span>
                        </div>
                    ))
                )}
                {asking && (
                    <div className="message bot-message flex items-center gap-2 border border-gray-100 shadow-sm">
                        <span className="text-xs font-bold opacity-60 mr-2 uppercase tracking-wider">AI Assistant</span>
                        <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: "0.4s"}}></div>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input Section */}
            <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                    type="text"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    disabled={!context || asking}
                    placeholder={context ? "Ask a question about the documents..." : "Upload documents first..."}
                    className="flex-grow rounded-lg border-gray-300 shadow-sm p-4 border focus:border-indigo-500 focus:ring-indigo-500 focus:ring-2 disabled:bg-gray-50 disabled:text-gray-400 text-lg transition-all"
                />
                <button
                    type="submit"
                    disabled={!context || asking || !currentMessage.trim()}
                    className={`px-8 py-4 rounded-lg text-white font-bold tracking-wide shadow-md transition-all
                            ${!context || asking || !currentMessage.trim() ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg transform hover:-translate-y-0.5'}`}
                >
                    <div className="flex items-center">
                        Send
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                    </div>
                </button>
            </form>
        </div>
    );
}

// Render both apps into their respective containers
const extractorRoot = ReactDOM.createRoot(document.getElementById('extractor-root'));
extractorRoot.render(<ExtractorApp />);

const chatRoot = ReactDOM.createRoot(document.getElementById('chat-root'));
chatRoot.render(<ChatApp />);

// Sidebar toggle logic (Running directly because Babel executes this script after DOM load)
const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('main-content');
const toggleBtn = document.getElementById('sidebar-toggle');

const navExtractor = document.getElementById('nav-extractor');
const navChat = document.getElementById('nav-chat');

const extractorContainer = document.getElementById('extractor-root');
const chatContainer = document.getElementById('chat-root');

// Toggle Sidebar
if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('closed');
        mainContent.classList.toggle('expanded');
    });
}

// Navigation Logic
if (navExtractor) {
    navExtractor.addEventListener('click', (e) => {
        e.preventDefault();
        navExtractor.classList.add('active');
        navChat.classList.remove('active');

        extractorContainer.classList.remove('hidden');
        chatContainer.classList.add('hidden');
    });
}

if (navChat) {
    navChat.addEventListener('click', (e) => {
        e.preventDefault();
        navChat.classList.add('active');
        navExtractor.classList.remove('active');

        chatContainer.classList.remove('hidden');
        extractorContainer.classList.add('hidden');
    });
}
