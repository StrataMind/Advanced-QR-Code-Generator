import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Link, MessageSquare, User, Download, Copy, Check, Wifi, Mail, Phone, MapPin, Calendar, CreditCard, Palette, BarChart3, FileText, Zap, Settings } from 'lucide-react';

const TRANSLATIONS = {
  "en-US": {
    "appTitle": "Advanced QR Code Generator",
    "appDescription": "Generate QR codes for URLs, text, contact info, WiFi, payments and more",
    "urlTab": "URL", "textTab": "Text", "contactTab": "Contact", "wifiTab": "WiFi", "smsTab": "SMS", 
    "emailTab": "Email", "phoneTab": "Phone", "locationTab": "Location", "eventTab": "Event", "paymentTab": "Payment",
    "customize": "Customize", "analytics": "Analytics", "batchGenerate": "Batch Generate",
    "foregroundColor": "Foreground", "backgroundColor": "Background", "size": "Size", "errorCorrection": "Error Level",
    "wifiNetwork": "WiFi Network", "networkName": "Network Name", "password": "Password", "security": "Security",
    "smsMessage": "SMS Message", "phoneNumber": "Phone Number", "message": "Message",
    "emailSubject": "Subject", "emailBody": "Body", "location": "Location", "latitude": "Latitude", "longitude": "Longitude",
    "eventTitle": "Event Title", "startDate": "Start Date", "endDate": "End Date", "description": "Description",
    "paymentAmount": "Amount", "currency": "Currency", "recipient": "Recipient",
    "totalGenerated": "Total Generated", "mostUsedType": "Most Used Type", "batchData": "Batch Data (one per line)"
  }
};

const t = (key) => TRANSLATIONS['en-US'][key] || key;

const AdvancedQRGenerator = () => {
  const [activeTab, setActiveTab] = useState('url');
  const [qrData, setQrData] = useState('');
  const [copied, setCopied] = useState(false);
  const qrContainerRef = useRef(null);
  
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [contactInfo, setContactInfo] = useState({ firstName: '', lastName: '', phone: '', email: '', organization: '', url: '' });
  const [wifiInfo, setWifiInfo] = useState({ ssid: '', password: '', security: 'WPA', hidden: false });
  const [smsInfo, setSmsInfo] = useState({ phone: '', message: '' });
  const [emailInfo, setEmailInfo] = useState({ email: '', subject: '', body: '' });
  const [phoneInfo, setPhoneInfo] = useState({ phone: '' });
  const [locationInfo, setLocationInfo] = useState({ lat: '', lng: '' });
  const [eventInfo, setEventInfo] = useState({ title: '', start: '', end: '', description: '' });
  const [paymentInfo, setPaymentInfo] = useState({ amount: '', currency: 'USD', recipient: '' });
  
  const [customization, setCustomization] = useState({ foreground: '#000000', background: '#ffffff', size: 300, errorLevel: 'M' });
  const [analytics, setAnalytics] = useState(() => {
    const saved = localStorage.getItem('qr-analytics');
    return saved ? JSON.parse(saved) : { total: 0, types: {} };
  });
  const [batchData, setBatchData] = useState('');
  const [showCustomization, setShowCustomization] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const generateQRCode = async (text) => {
    if (!text.trim()) {
      if (qrContainerRef.current) qrContainerRef.current.innerHTML = '';
      return;
    }

    try {
      if (!window.QRious) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js';
        script.onload = () => createQR(text);
        document.head.appendChild(script);
      } else {
        createQR(text);
      }
    } catch (error) {
      generateFallbackQR(text);
    }
  };

  const createQR = (text) => {
    if (!qrContainerRef.current) return;
    qrContainerRef.current.innerHTML = '';
    const canvas = document.createElement('canvas');
    qrContainerRef.current.appendChild(canvas);
    
    new window.QRious({
      element: canvas,
      value: text,
      size: customization.size,
      background: customization.background,
      foreground: customization.foreground,
      level: customization.errorLevel
    });
    
    canvas.className = 'w-full h-auto rounded-xl shadow-lg bg-white';
    canvas.style.maxWidth = '300px';
  };

  const generateFallbackQR = (text) => {
    if (!qrContainerRef.current) return;
    qrContainerRef.current.innerHTML = '';
    const img = document.createElement('img');
    const encodedData = encodeURIComponent(text);
    img.src = `https://chart.googleapis.com/chart?chs=${customization.size}x${customization.size}&cht=qr&chl=${encodedData}&choe=UTF-8`;
    img.className = 'w-full h-auto rounded-xl shadow-lg bg-white p-4';
    img.style.maxWidth = '300px';
    qrContainerRef.current.appendChild(img);
  };

  const formatUrl = (url) => url.trim() && !url.startsWith('http') ? 'https://' + url : url;
  const generateVCard = (c) => `BEGIN:VCARD\nVERSION:3.0\nFN:${c.firstName} ${c.lastName}\nN:${c.lastName};${c.firstName};;;\nORG:${c.organization}\nTEL:${c.phone}\nEMAIL:${c.email}\nURL:${c.url}\nEND:VCARD`;
  const generateWiFi = (w) => `WIFI:T:${w.security};S:${w.ssid};P:${w.password};H:${w.hidden};;`;
  const generateSMS = (s) => `SMSTO:${s.phone}:${s.message}`;
  const generateEmail = (e) => `mailto:${e.email}?subject=${encodeURIComponent(e.subject)}&body=${encodeURIComponent(e.body)}`;
  const generatePhone = (p) => `tel:${p.phone}`;
  const generateLocation = (l) => `geo:${l.lat},${l.lng}`;
  const generateEvent = (e) => {
    const start = new Date(e.start).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const end = new Date(e.end).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    return `BEGIN:VEVENT\nSUMMARY:${e.title}\nDTSTART:${start}\nDTEND:${end}\nDESCRIPTION:${e.description}\nEND:VEVENT`;
  };
  const generatePayment = (p) => `upi://pay?pa=${p.recipient}&am=${p.amount}&cu=${p.currency}`;

  const updateAnalytics = (type) => {
    const newAnalytics = { total: analytics.total + 1, types: { ...analytics.types, [type]: (analytics.types[type] || 0) + 1 } };
    setAnalytics(newAnalytics);
    localStorage.setItem('qr-analytics', JSON.stringify(newAnalytics));
  };

  useEffect(() => {
    let data = '';
    switch (activeTab) {
      case 'url': data = formatUrl(urlInput); break;
      case 'text': data = textInput; break;
      case 'contact': if (contactInfo.firstName || contactInfo.lastName || contactInfo.phone || contactInfo.email) data = generateVCard(contactInfo); break;
      case 'wifi': if (wifiInfo.ssid) data = generateWiFi(wifiInfo); break;
      case 'sms': if (smsInfo.phone) data = generateSMS(smsInfo); break;
      case 'email': if (emailInfo.email) data = generateEmail(emailInfo); break;
      case 'phone': if (phoneInfo.phone) data = generatePhone(phoneInfo); break;
      case 'location': if (locationInfo.lat && locationInfo.lng) data = generateLocation(locationInfo); break;
      case 'event': if (eventInfo.title) data = generateEvent(eventInfo); break;
      case 'payment': if (paymentInfo.recipient && paymentInfo.amount) data = generatePayment(paymentInfo); break;
    }
    setQrData(data);
    if (data) {
      generateQRCode(data);
      updateAnalytics(activeTab);
    }
  }, [activeTab, urlInput, textInput, contactInfo, wifiInfo, smsInfo, emailInfo, phoneInfo, locationInfo, eventInfo, paymentInfo, customization]);

  const downloadQRCode = () => {
    if (!qrData) return;
    const canvas = qrContainerRef.current?.querySelector('canvas');
    const img = qrContainerRef.current?.querySelector('img');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `qr-code-${activeTab}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } else if (img) {
      const link = document.createElement('a');
      link.download = `qr-code-${activeTab}.png`;
      link.href = img.src;
      link.click();
    }
  };

  const copyToClipboard = async () => {
    if (qrData) {
      try {
        await navigator.clipboard.writeText(qrData);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  const generateBatch = () => {
    const lines = batchData.split('\n').filter(line => line.trim());
    lines.forEach((line, index) => {
      setTimeout(() => {
        const canvas = document.createElement('canvas');
        new window.QRious({ element: canvas, value: line, size: 200 });
        const link = document.createElement('a');
        link.download = `qr-batch-${index + 1}.png`;
        link.href = canvas.toDataURL();
        link.click();
      }, index * 100);
    });
  };

  const tabs = [
    { id: 'url', label: t('urlTab'), icon: Link },
    { id: 'text', label: t('textTab'), icon: MessageSquare },
    { id: 'contact', label: t('contactTab'), icon: User },
    { id: 'wifi', label: t('wifiTab'), icon: Wifi },
    { id: 'sms', label: t('smsTab'), icon: MessageSquare },
    { id: 'email', label: t('emailTab'), icon: Mail },
    { id: 'phone', label: t('phoneTab'), icon: Phone },
    { id: 'location', label: t('locationTab'), icon: MapPin },
    { id: 'event', label: t('eventTab'), icon: Calendar },
    { id: 'payment', label: t('paymentTab'), icon: CreditCard }
  ];

  const renderForm = () => {
    switch (activeTab) {
      case 'url':
        return <input type="url" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="https://example.com" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />;
      case 'text':
        return <textarea value={textInput} onChange={(e) => setTextInput(e.target.value)} placeholder="Enter any text..." rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none" />;
      case 'contact':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input type="text" value={contactInfo.firstName} onChange={(e) => setContactInfo({...contactInfo, firstName: e.target.value})} placeholder="First Name" className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              <input type="text" value={contactInfo.lastName} onChange={(e) => setContactInfo({...contactInfo, lastName: e.target.value})} placeholder="Last Name" className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
            <input type="tel" value={contactInfo.phone} onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})} placeholder="Phone" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            <input type="email" value={contactInfo.email} onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})} placeholder="Email" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            <input type="text" value={contactInfo.organization} onChange={(e) => setContactInfo({...contactInfo, organization: e.target.value})} placeholder="Organization" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
          </div>
        );
      case 'wifi':
        return (
          <div className="space-y-4">
            <input type="text" value={wifiInfo.ssid} onChange={(e) => setWifiInfo({...wifiInfo, ssid: e.target.value})} placeholder="Network Name (SSID)" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            <input type="password" value={wifiInfo.password} onChange={(e) => setWifiInfo({...wifiInfo, password: e.target.value})} placeholder="Password" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            <select value={wifiInfo.security} onChange={(e) => setWifiInfo({...wifiInfo, security: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option value="WPA">WPA/WPA2</option>
              <option value="WEP">WEP</option>
              <option value="nopass">Open</option>
            </select>
          </div>
        );
      case 'sms':
        return (
          <div className="space-y-4">
            <input type="tel" value={smsInfo.phone} onChange={(e) => setSmsInfo({...smsInfo, phone: e.target.value})} placeholder="Phone Number" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            <textarea value={smsInfo.message} onChange={(e) => setSmsInfo({...smsInfo, message: e.target.value})} placeholder="Message" rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none" />
          </div>
        );
      case 'email':
        return (
          <div className="space-y-4">
            <input type="email" value={emailInfo.email} onChange={(e) => setEmailInfo({...emailInfo, email: e.target.value})} placeholder="Email Address" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            <input type="text" value={emailInfo.subject} onChange={(e) => setEmailInfo({...emailInfo, subject: e.target.value})} placeholder="Subject" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            <textarea value={emailInfo.body} onChange={(e) => setEmailInfo({...emailInfo, body: e.target.value})} placeholder="Body" rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none" />
          </div>
        );
      case 'phone':
        return <input type="tel" value={phoneInfo.phone} onChange={(e) => setPhoneInfo({...phoneInfo, phone: e.target.value})} placeholder="Phone Number" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />;
      case 'location':
        return (
          <div className="space-y-4">
            <input type="number" step="any" value={locationInfo.lat} onChange={(e) => setLocationInfo({...locationInfo, lat: e.target.value})} placeholder="Latitude" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            <input type="number" step="any" value={locationInfo.lng} onChange={(e) => setLocationInfo({...locationInfo, lng: e.target.value})} placeholder="Longitude" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
          </div>
        );
      case 'event':
        return (
          <div className="space-y-4">
            <input type="text" value={eventInfo.title} onChange={(e) => setEventInfo({...eventInfo, title: e.target.value})} placeholder="Event Title" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            <input type="datetime-local" value={eventInfo.start} onChange={(e) => setEventInfo({...eventInfo, start: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            <input type="datetime-local" value={eventInfo.end} onChange={(e) => setEventInfo({...eventInfo, end: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            <textarea value={eventInfo.description} onChange={(e) => setEventInfo({...eventInfo, description: e.target.value})} placeholder="Description" rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none" />
          </div>
        );
      case 'payment':
        return (
          <div className="space-y-4">
            <input type="text" value={paymentInfo.recipient} onChange={(e) => setPaymentInfo({...paymentInfo, recipient: e.target.value})} placeholder="Recipient ID" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            <input type="number" step="0.01" value={paymentInfo.amount} onChange={(e) => setPaymentInfo({...paymentInfo, amount: e.target.value})} placeholder="Amount" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            <select value={paymentInfo.currency} onChange={(e) => setPaymentInfo({...paymentInfo, currency: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="INR">INR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen p-4" style={{
      width: '100%',
      height: '100%',
      '--color': '#E1E1E1',
      backgroundColor: '#F3F3F3',
      backgroundImage: `linear-gradient(0deg, transparent 24%, var(--color) 25%, var(--color) 26%, transparent 27%, transparent 74%, var(--color) 75%, var(--color) 76%, transparent 77%, transparent),
        linear-gradient(90deg, transparent 24%, var(--color) 25%, var(--color) 26%, transparent 27%, transparent 74%, var(--color) 75%, var(--color) 76%, transparent 77%, transparent)`,
      backgroundSize: '55px 55px'
    }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl mb-4">
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            {t('appTitle')}
          </h1>
          <p className="text-gray-600 text-lg">{t('appDescription')}</p>
          <div className="flex justify-center gap-4 mt-4">
            <button onClick={() => setShowCustomization(!showCustomization)} className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
              <Palette className="w-4 h-4" /> {t('customize')}
            </button>
            <button onClick={() => setShowAnalytics(!showAnalytics)} className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
              <BarChart3 className="w-4 h-4" /> {t('analytics')}
            </button>
          </div>
        </div>

        {showCustomization && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Customization</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Foreground</label>
                <input type="color" value={customization.foreground} onChange={(e) => setCustomization({...customization, foreground: e.target.value})} className="w-full h-10 rounded border" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Background</label>
                <input type="color" value={customization.background} onChange={(e) => setCustomization({...customization, background: e.target.value})} className="w-full h-10 rounded border" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Size</label>
                <input type="range" min="200" max="500" value={customization.size} onChange={(e) => setCustomization({...customization, size: parseInt(e.target.value)})} className="w-full" />
                <span className="text-sm text-gray-500">{customization.size}px</span>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Error Level</label>
                <select value={customization.errorLevel} onChange={(e) => setCustomization({...customization, errorLevel: e.target.value})} className="w-full px-3 py-2 border rounded">
                  <option value="L">Low</option>
                  <option value="M">Medium</option>
                  <option value="Q">Quartile</option>
                  <option value="H">High</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {showAnalytics && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Analytics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{analytics.total}</div>
                <div className="text-sm text-gray-500">Total Generated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{Object.keys(analytics.types).length}</div>
                <div className="text-sm text-gray-500">Types Used</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{Object.entries(analytics.types).sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'}</div>
                <div className="text-sm text-gray-500">Most Popular</div>
              </div>
              <div className="text-center">
                <button onClick={() => {setAnalytics({total: 0, types: {}}); localStorage.removeItem('qr-analytics');}} className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  {tabs.find(t => t.id === activeTab)?.label} Generator
                </h2>
                {renderForm()}
                
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Batch Generate</h3>
                  <textarea
                    value={batchData}
                    onChange={(e) => setBatchData(e.target.value)}
                    placeholder="Enter multiple items (one per line) for batch generation..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                  <button
                    onClick={generateBatch}
                    disabled={!batchData.trim()}
                    className="mt-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-300 transition-colors"
                  >
                    <FileText className="w-4 h-4 inline mr-2" />
                    Generate Batch
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800">Generated QR Code</h2>
                
                <div className="bg-gray-50 rounded-2xl p-8 w-full max-w-sm">
                  {qrData ? (
                    <div className="text-center">
                      <div ref={qrContainerRef} className="flex justify-center"></div>
                      <p className="text-sm text-gray-600 mt-4">Scan this QR code with your device</p>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Fill in the form to generate your QR code</p>
                    </div>
                  )}
                </div>

                {qrData && (
                  <div className="flex gap-4 w-full max-w-sm">
                    <button
                      onClick={downloadQRCode}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    
                    <button
                      onClick={copyToClipboard}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-green-600" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy Data
                        </>
                      )}
                    </button>
                  </div>
                )}

                {qrData && (
                  <div className="w-full max-w-sm">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">QR Code Data:</h3>
                    <div className="bg-gray-100 rounded-lg p-3 text-xs text-gray-600 max-h-32 overflow-y-auto">
                      <pre className="whitespace-pre-wrap break-words">{qrData}</pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Advanced QR Generator • 10 Types • Customizable • Analytics • Batch Generation</p>
        </div>
      </div>
    </div>
  );
};

export default AdvancedQRGenerator;