# Advanced QR Code Generator

A modern, feature-rich QR code generator built with React and Vite. Generate QR codes for 10 different data types with customization options, analytics, and batch processing.

## 🚀 Features

### QR Code Types
- **URL** - Website links with auto-https
- **Text** - Plain text content
- **Contact** - vCard format with full contact info
- **WiFi** - Network credentials (WPA/WEP/Open)
- **SMS** - Pre-filled text messages
- **Email** - With subject and body
- **Phone** - Direct call links
- **Location** - GPS coordinates
- **Event** - Calendar events (iCal format)
- **Payment** - UPI payment links

### Advanced Features
- 🎨 **Customization** - Colors, size, error correction
- 📊 **Analytics** - Usage tracking and statistics
- ⚡ **Batch Generation** - Multiple QR codes at once
- 📱 **Responsive Design** - Works on all devices
- 🌐 **Multi-language** - English and Spanish support
- 💾 **Local Storage** - Persistent analytics data

## 🛠️ Installation

```bash
# Clone the repository
git clone <repository-url>
cd qr-code-generator

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📋 Requirements

- Node.js 16+
- Modern web browser
- Internet connection (for QR library CDN)

## 🎯 Usage

1. Select QR code type from tabs
2. Fill in the required information
3. Customize appearance (optional)
4. Download or copy the generated QR code
5. Use batch generation for multiple codes

## 🔧 Technical Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **QRious** - QR code generation
- **Local Storage** - Analytics persistence

## 📊 QR Code Formats

| Type | Format | Example |
|------|--------|---------|
| URL | `https://example.com` | Direct link |
| WiFi | `WIFI:T:WPA;S:MyNetwork;P:password;;` | Network config |
| SMS | `SMSTO:+1234567890:Hello` | Text message |
| Email | `mailto:user@example.com?subject=Hi` | Email draft |
| vCard | `BEGIN:VCARD...END:VCARD` | Contact info |
| Location | `geo:40.7128,-74.0060` | GPS coordinates |
| Payment | `upi://pay?pa=user@bank&am=100` | UPI payment |

## 🎨 Customization Options

- **Colors**: Foreground and background
- **Size**: 200px to 500px
- **Error Correction**: L (Low) to H (High)
- **Real-time Preview**: Instant updates

## 📈 Analytics

- Total QR codes generated
- Most popular QR type
- Usage statistics by type
- Data persisted locally

## 🔄 Batch Processing

Generate multiple QR codes by entering data one per line:
```
https://example1.com
https://example2.com
Contact info for John Doe
```

## 🌐 Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 📄 License

MIT License - feel free to use for personal and commercial projects.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Submit pull request

## 🐛 Known Issues

- Batch generation requires QRious library to be loaded
- Large QR codes may affect performance on older devices
- Some QR scanners may not support all formats

## 📞 Support

For issues or questions, please create an issue in the repository.