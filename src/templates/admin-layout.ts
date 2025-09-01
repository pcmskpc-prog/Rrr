export const adminLayout = (title: string, content: string, scripts: string = '') => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - SATYAM GOLD Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        .admin-sidebar { min-height: 100vh; }
        .btn-admin {
            background: #ff8c42;
            color: white;
            padding: 8px 16px;
            border-radius: 6px;
            transition: all 0.3s;
        }
        .btn-admin:hover { opacity: 0.9; }
        .btn-danger {
            background: #dc3545;
            color: white;
            padding: 8px 16px;
            border-radius: 6px;
        }
        .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
        .status-pending { background: #ffc107; color: #000; }
        .status-confirmed { background: #17a2b8; color: #fff; }
        .status-processing { background: #6c757d; color: #fff; }
        .status-shipped { background: #fd7e14; color: #fff; }
        .status-delivered { background: #28a745; color: #fff; }
        .status-cancelled { background: #dc3545; color: #fff; }
    </style>
</head>
<body class="bg-gray-100">
    <div class="flex">
        <!-- Sidebar -->
        <aside class="admin-sidebar w-64 bg-gray-900 text-white">
            <div class="p-6">
                <div class="flex items-center space-x-3 mb-8">
                    <div class="bg-orange-500 rounded p-2">
                        <span class="text-white font-bold text-xl">SG</span>
                    </div>
                    <div>
                        <h2 class="text-xl font-bold">SATYAM GOLD</h2>
                        <p class="text-xs text-gray-400">Admin Panel</p>
                    </div>
                </div>
                
                <nav class="space-y-2">
                    <a href="/admin" class="block px-4 py-3 rounded hover:bg-gray-800 transition">
                        <i class="fas fa-dashboard mr-3"></i> Dashboard
                    </a>
                    <a href="/admin/orders" class="block px-4 py-3 rounded hover:bg-gray-800 transition">
                        <i class="fas fa-shopping-bag mr-3"></i> Orders
                    </a>
                    <a href="/admin/products" class="block px-4 py-3 rounded hover:bg-gray-800 transition">
                        <i class="fas fa-box mr-3"></i> Products
                    </a>
                    <a href="/admin/settings" class="block px-4 py-3 rounded hover:bg-gray-800 transition">
                        <i class="fas fa-cog mr-3"></i> Site Settings
                    </a>
                    <a href="/" target="_blank" class="block px-4 py-3 rounded hover:bg-gray-800 transition">
                        <i class="fas fa-external-link-alt mr-3"></i> View Website
                    </a>
                    <a href="/admin/logout" class="block px-4 py-3 rounded hover:bg-gray-800 transition text-red-400">
                        <i class="fas fa-sign-out-alt mr-3"></i> Logout
                    </a>
                </nav>
            </div>
        </aside>
        
        <!-- Main Content -->
        <main class="flex-1 p-8">
            ${content}
        </main>
    </div>
    
    ${scripts}
</body>
</html>
`