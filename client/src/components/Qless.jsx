import { useState, useEffect } from "react";
import AlooParathaImg from "../assets/Aloo Paratha.jpg";
import MasalaDosaImg from "../assets/masala dosa.jpg";
import PohaImg from "../assets/Poha.jpg";
import SamosaImg from "../assets/Samosa.jpg";
import VadaPavImg from "../assets/Vada Pav.jpeg";
import BhindiImg from "../assets/Bhindi Masala.jpg";
import HakkaImg from "../assets/hakka noddles.jpg";
import PavBhajiImg from "../assets/pav bhaji.jpg";

// ─── DATA ────────────────────────────────────────────────────────────────────
const menuItems = [
  {
    id: 1,
    name: "Masala Dosa",
    category: "Breakfast",
    price: 60.00,
    calories: 300,
    tags: ["HIGH DEMAND"],
    img: MasalaDosaImg,
    desc: "Crispy dosa served with sambar and coconut chutney"
  },
  {
    id: 2,
    name: "Biryani",
    category: "Lunch",
    price: 95.00,
    calories: 650,
    tags: ["HEARTY"],
    img: "",
    desc: "Aromatic layered rice cooked with spices, mixed vegetables or meat, served with raita"
  },
  {
    id: 3,
    name: "Poha",
    category: "Breakfast",
    price: 35.00,
    calories: 250,
    tags: ["VEGAN"],
    img: PohaImg,
    desc: "Lightly spiced flattened rice with peanuts and curry leaves"
  },
  {
    id: 4,
    name: "Aloo Paratha",
    category: "Breakfast",
    price: 50.00,
    calories: 420,
    tags: ["HIGH DEMAND"],
    img: AlooParathaImg,
    desc: "Stuffed potato paratha served with curd and pickle"
  },
  {
    id: 5,
    name: "Bhindi Masala",
    category: "Snacks",
    price: 38.00,
    calories: 200,
    tags: ["VEGETARIAN"],
    img: BhindiImg,
    desc: "Spiced okra stir-fry with onions and Indian spices"
  },
  {
    id: 6,
    name: "Samosa (2 pcs)",
    category: "Snacks",
    price: 25.00,
    calories: 300,
    tags: ["SNACK"],
    img: SamosaImg,
    desc: "Crispy pastry filled with spiced potatoes"
  },
  {
    id: 7,
    name: "Vada Pav",
    category: "Snacks",
    price: 30.00,
    calories: 350,
    tags: ["HIGH DEMAND"],
    img: VadaPavImg,
    desc: "Mumbai-style spicy potato fritter in a bun"
  },
  {
    id: 9,
    name: "Hakka Noodles",
    category: "Lunch",
    price: 80.00,
    calories: 600,
    tags: ["HEARTY"],
    img: HakkaImg,
    desc: "Stir-fried Hakka noodles with mixed vegetables and savory sauces"
  },
  {
    id: 10,
    name: "Pav Bhaji",
    category: "Snacks",
    price: 70.00,
    calories: 520,
    tags: ["VEGETARIAN", "HEARTY"],
    img: PavBhajiImg,
    desc: "Spicy mashed vegetable curry (bhaji) served with buttery pav"
  },
  {
    id: 11,
    name: "Lassi",
    category: "Snacks",
    price: 30.00,
    calories: 180,
    tags: ["DRINK"],
    img: "",
    desc: "Sweet or salted chilled lassi"
  },
  {
    id: 12,
    name: "Filter Coffee",
    category: "Drinks",
    price: 20.00,
    calories: 60,
    tags: ["HOT"],
    img: "",
    desc: "Strong south Indian filter coffee"
  },
];

// Resolve local assets (if present) using Vite's glob import
const assetModules = import.meta.glob('../assets/*.{png,jpg,jpeg,webp}', { eager: true, as: 'url' });

const normalizeKey = s => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');

const findAssetFor = name => {
  const key = normalizeKey(name);
  for (const p in assetModules) {
    if (p.toLowerCase().includes(key)) return assetModules[p];
  }
  return null;
};

const initialOrders = [
  { id: "OD-1001", name: "Poha Combo", desc: "Poha + Filter Coffee", price: 55, status: "PREPARING", time: "Today, 09:15 AM", img: menuItems[2].img },
  { id: "OD-1002", name: "Samosa Pack", desc: "Samosa (2 pcs) + Chai", price: 30, status: "READY", time: "Today, 11:40 AM", img: menuItems[5].img },
  { id: "OD-1003", name: "Vada Pav Meal", desc: "Vada Pav + Lassi", price: 60, status: "COMPLETED", time: "Yesterday, 07:22 PM", img: menuItems[6].img },
];

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Icon = ({ name, cls = "w-5 h-5" }) => {
  const icons = {
    home: <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />,
    menu: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />,
    orders: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />,
    insights: <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />,
    cart: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />,
    bell: <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />,
    user: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />,
    plus: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />,
    minus: <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />,
    trash: <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />,
    search: <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />,
    arrow: <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />,
    tag: <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />,
    fire: <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />,
    location: <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />,
    star: <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />,
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={cls}>
      {icons[name]}
    </svg>
  );
};

// ─── NAVBAR ──────────────────────────────────────────────────────────────────
const Navbar = ({ page, setPage, cartCount }) => {
  const navItems = [
    { id: "home", label: "Home", icon: "home" },
    { id: "menu", label: "Menu", icon: "menu" },
    { id: "orders", label: "Orders", icon: "orders" },
    { id: "insights", label: "Insights", icon: "insights" },
  ];
  return (
    <nav style={{ background: "#fff", borderBottom: "1px solid #e8ede8" }} className="sticky top-0 z-50 flex items-center justify-between px-8 py-3 shadow-sm">
      <button onClick={() => setPage("home")} className="flex items-center gap-2 focus:outline-none">
        <div style={{ background: "linear-gradient(135deg,#1a6b3a,#2d9d5c)", borderRadius: 10 }} className="w-8 h-8 flex items-center justify-center">
          <span className="text-white font-black text-sm">Q</span>
        </div>
        <span style={{ fontFamily: "'Georgia', serif", color: "#1a6b3a", letterSpacing: "-0.5px" }} className="text-xl font-bold">QLess</span>
      </button>
      <div className="flex items-center gap-1">
        {navItems.map(n => (
          <button key={n.id} onClick={() => setPage(n.id)}
            style={{ color: page === n.id ? "#1a6b3a" : "#6b7280", fontWeight: page === n.id ? 700 : 400, borderBottom: page === n.id ? "2px solid #1a6b3a" : "2px solid transparent" }}
            className="flex items-center gap-1.5 px-4 py-2 text-sm transition-all hover:text-green-700">
            <Icon name={n.icon} cls="w-4 h-4" />
            {n.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => setPage("cart")} className="relative p-2 rounded-full hover:bg-green-50 transition-colors" style={{ color: "#1a6b3a" }}>
          <Icon name="cart" cls="w-5 h-5" />
          {cartCount > 0 && (
            <span style={{ background: "#1a6b3a", top: 2, right: 2 }} className="absolute w-4 h-4 text-white text-xs rounded-full flex items-center justify-center font-bold">{cartCount}</span>
          )}
        </button>
        <button className="p-2 rounded-full hover:bg-green-50 transition-colors" style={{ color: "#6b7280" }}>
          <Icon name="bell" cls="w-5 h-5" />
        </button>
        <div style={{ background: "#1a6b3a" }} className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm cursor-pointer">D</div>
      </div>
    </nav>
  );
};

// ─── HOME PAGE ───────────────────────────────────────────────────────────────
const HomePage = ({ setPage, cart, addToCart, menuItems }) => {
  const trending = menuItems.filter(m => m.tags.includes("HIGH DEMAND")).slice(0, 3);
  const daily = menuItems.slice(4, 8);
  return (
    <div style={{ background: "#f7f9f5", minHeight: "calc(100vh - 57px)" }} className="p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 style={{ fontFamily: "'Georgia', serif", color: "#1a2e1a", fontSize: 32 }} className="font-bold mb-1">Hi Divya 👋</h1>
            <p style={{ color: "#6b7280" }} className="text-sm">Lunch Slot (12–2 PM)</p>
          </div>
          <span style={{ background: "#e6f4ec", color: "#1a6b3a", border: "1px solid #b8dfc8" }} className="text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse"></span>
            Inside Campus
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "TOTAL SPENDING", value: "₹245.80", sub: "+2% this week", color: "#1a6b3a" },
            { label: "TOTAL ORDERS", value: "42", sub: "Meals delivered", color: "#1a6b3a" },
            { label: "FAVOURITE ITEM", value: "Vada Pav", sub: "Ordered 5 times", img: menuItems[6].img },
          ].map((s, i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #e8ede8", borderRadius: 14 }} className="p-5">
              <p style={{ color: "#9ca3af", letterSpacing: "0.08em" }} className="text-xs font-semibold mb-2">{s.label}</p>
                  {s.img ? (
                <div className="flex items-center gap-3">
                  <img src={s.img} className="w-10 h-10 rounded-lg object-cover" />
                  <div>
                    <p style={{ color: "#1a2e1a", fontFamily: "'Georgia', serif" }} className="font-semibold text-sm">{s.value}</p>
                    <p style={{ color: "#9ca3af" }} className="text-xs">{s.sub}</p>
                  </div>
                </div>
                  ) : (
                <>
                  <p style={{ color: s.color, fontFamily: "'Georgia', serif", fontSize: 26 }} className="font-bold leading-none">{s.value}</p>
                  <p style={{ color: "#6b7280" }} className="text-xs mt-1">{s.sub}</p>
                </>
                  )}
            </div>
          ))}
        </div>

        {/* Trending Now */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ color: "#1a2e1a", fontFamily: "'Georgia', serif" }} className="text-xl font-bold flex items-center gap-2">
              <Icon name="fire" cls="w-5 h-5 text-orange-500" /> Trending Now
            </h2>
            <button onClick={() => setPage("menu")} style={{ color: "#1a6b3a" }} className="text-sm font-semibold hover:underline">View all</button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {trending.map(item => (
              <div key={item.id} style={{ background: "#fff", border: "1px solid #e8ede8", borderRadius: 16, overflow: "hidden" }} className="group hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img src={item.img} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span style={{ background: "#ef4444", top: 10, left: 10 }} className="absolute text-white text-xs font-bold px-2 py-0.5 rounded-full">HOT</span>
                </div>
                <div className="p-4">
                  <p style={{ color: "#1a2e1a", fontFamily: "'Georgia', serif" }} className="font-semibold">{item.name}</p>
                  <p style={{ color: "#9ca3af" }} className="text-xs mt-1 line-clamp-2">{item.desc}</p>
                  <div className="flex items-center justify-between mt-3">
                      <span style={{ color: "#1a6b3a" }} className="font-bold text-lg">₹{item.price.toFixed(2)}</span>
                    <button onClick={() => addToCart(item)} style={{ background: "#1a6b3a" }} className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-green-700 transition-colors">
                      <Icon name="plus" cls="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Curations */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ color: "#1a2e1a", fontFamily: "'Georgia', serif" }} className="text-xl font-bold">Daily Curations</h2>
            <div className="flex gap-2">
              {["ALL", "VEGAN", "PROTEIN+"].map(t => (
                <span key={t} style={{ background: t === "ALL" ? "#1a6b3a" : "#f0f7f2", color: t === "ALL" ? "#fff" : "#1a6b3a", border: "1px solid #b8dfc8" }} className="text-xs font-semibold px-3 py-1 rounded-full cursor-pointer">{t}</span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {daily.map(item => (
              <div key={item.id} style={{ background: "#fff", border: "1px solid #e8ede8", borderRadius: 16, overflow: "hidden" }} className="group hover:shadow-md transition-shadow">
                <div className="relative">
                  <img src={item.img} className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span style={{ background: "#1a6b3a", top: 8, left: 8 }} className="absolute text-white text-xs font-bold px-2 py-0.5 rounded-full">{item.tags[0]}</span>
                </div>
                <div className="p-3">
                  <p style={{ color: "#1a2e1a" }} className="font-semibold text-sm">{item.name}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span style={{ color: "#1a6b3a" }} className="font-bold">₹{item.price.toFixed(2)}</span>
                    <button onClick={() => addToCart(item)} style={{ background: "#1a6b3a", color: "#fff", border: "none" }} className="text-xs font-semibold px-3 py-1 rounded-full hover:bg-green-700 transition-colors">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── MENU PAGE ───────────────────────────────────────────────────────────────
const MenuPage = ({ menuItems, cart, addToCart, setPage }) => {
  const [activeTab, setActiveTab] = useState("Breakfast");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const tabs = ["Breakfast", "Lunch", "Snacks"];
  const filters = ["ALL", "HIGH DEMAND", "LOW CALORIE", "VEGAN", "GLUTEN-FREE"];
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartQty = cart.reduce((s, i) => s + i.qty, 0);

  const filtered = menuItems.filter(m => {
    const matchTab = m.category === activeTab;
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === "ALL" || m.tags.includes(activeFilter);
    return matchTab && matchSearch && matchFilter;
  });

  return (
    <div style={{ background: "#f7f9f5", minHeight: "calc(100vh - 57px)" }} className="flex">
      {/* Main */}
      <div className="flex-1 p-8">
        <div className="max-w-3xl">
          <h1 style={{ fontFamily: "'Georgia', serif", color: "#1a2e1a", fontSize: 34 }} className="font-bold mb-1">Menu</h1>
          <p style={{ color: "#9ca3af" }} className="text-sm mb-6">Browse and order your favourite food from our curated garden kitchen.</p>

          {/* Search + Tabs */}
          <div className="flex items-center gap-4 mb-5">
            <div style={{ background: "#fff", border: "1px solid #e8ede8", borderRadius: 12 }} className="flex items-center gap-2 flex-1 px-4 py-2.5">
              <Icon name="search" cls="w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search for bowls, smoothies or salads..." className="flex-1 text-sm outline-none bg-transparent" style={{ color: "#374151" }} />
            </div>
            {tabs.map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                style={{ background: activeTab === t ? "#1a6b3a" : "#fff", color: activeTab === t ? "#fff" : "#6b7280", border: "1px solid #e8ede8", borderRadius: 10 }}
                className="px-5 py-2.5 text-sm font-semibold transition-colors">
                {t}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {filters.map(f => (
              <button key={f} onClick={() => setActiveFilter(f)}
                style={{ background: activeFilter === f ? "#1a6b3a" : "#f0f7f2", color: activeFilter === f ? "#fff" : "#1a6b3a", border: "1px solid #b8dfc8", borderRadius: 20 }}
                className="text-xs font-bold px-3 py-1 transition-colors">
                {f}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 gap-5">
            {filtered.map(item => (
              <div key={item.id} style={{ background: "#fff", border: "1px solid #e8ede8", borderRadius: 16, overflow: "hidden" }} className="group hover:shadow-lg transition-all">
                <div className="relative">
                  <img src={item.img} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                    {item.tags.slice(0, 1).map(tag => (
                      <span key={tag} style={{ background: tag === "HIGH DEMAND" ? "#ef4444" : tag === "VEGAN" ? "#1a6b3a" : "#f59e0b", color: "#fff" }} className="text-xs font-bold px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                  <span style={{ background: "rgba(0,0,0,0.55)", color: "#fff", bottom: 8, right: 8 }} className="absolute text-xs px-2 py-0.5 rounded-full">{item.calories} cal</span>
                </div>
                <div className="p-4">
                  <p style={{ fontFamily: "'Georgia', serif", color: "#1a2e1a" }} className="font-semibold text-base">{item.name}</p>
                  <p style={{ color: "#9ca3af" }} className="text-xs mt-1 line-clamp-2">{item.desc}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span style={{ color: "#1a6b3a" }} className="font-bold text-lg">₹{item.price.toFixed(2)}</span>
                    <button onClick={() => addToCart(item)} style={{ background: "#1a6b3a" }} className="w-9 h-9 rounded-full flex items-center justify-center text-white hover:bg-green-700 transition-colors">
                      <Icon name="plus" cls="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <div style={{ width: 300, background: "#fff", borderLeft: "1px solid #e8ede8", minHeight: "calc(100vh - 57px)" }} className="p-5 sticky top-[57px] self-start">
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ fontFamily: "'Georgia', serif", color: "#1a2e1a" }} className="font-bold text-lg">Your Cart</h3>
          <span style={{ background: "#1a6b3a" }} className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold">{cartQty}</span>
        </div>
        {cart.length === 0 ? (
          <p style={{ color: "#9ca3af" }} className="text-sm text-center py-8">Your cart is empty</p>
        ) : (
          <>
            <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
              {cart.map(item => (
                <div key={item.id} style={{ border: "1px solid #e8ede8", borderRadius: 12 }} className="flex items-center gap-3 p-2">
                  <img src={item.img} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p style={{ color: "#1a2e1a" }} className="text-xs font-semibold truncate">{item.name}</p>
                      <p style={{ color: "#1a6b3a" }} className="text-xs font-bold">₹{(item.price * item.qty).toFixed(2)}</p>
                  </div>
                  <span style={{ color: "#6b7280" }} className="text-xs font-bold">×{item.qty}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid #e8ede8" }} className="pt-3 space-y-1 text-sm mb-4">
              <div className="flex justify-between" style={{ color: "#6b7280" }}><span>Subtotal</span><span>₹{cartTotal.toFixed(2)}</span></div>
              <div className="flex justify-between" style={{ color: "#6b7280" }}><span>Delivery Fee</span><span className="text-green-600 font-semibold">FREE</span></div>
              <div className="flex justify-between font-bold text-base mt-2" style={{ color: "#1a2e1a" }}><span>Total</span><span>₹{cartTotal.toFixed(2)}</span></div>
            </div>
            <button onClick={() => setPage("cart")} style={{ background: "#1a6b3a", borderRadius: 12 }} className="w-full py-3 text-white text-sm font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
              View Cart <Icon name="arrow" cls="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ─── CART PAGE ───────────────────────────────────────────────────────────────
const CartPage = ({ cart, setCart, setPage }) => {
  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0));
  };
  const removeItem = id => setCart(prev => prev.filter(i => i.id !== id));
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = subtotal * 0.08;
  const delivery = 2.00;
  const total = subtotal + tax + delivery;
  const [placed, setPlaced] = useState(false);

  if (placed) return (
    <div style={{ background: "#f7f9f5", minHeight: "calc(100vh - 57px)" }} className="flex items-center justify-center">
      <div style={{ background: "#fff", border: "1px solid #e8ede8", borderRadius: 20 }} className="text-center p-12 max-w-md">
        <div style={{ background: "#e6f4ec", width: 80, height: 80, borderRadius: "50%", margin: "0 auto 20px" }} className="flex items-center justify-center">
          <Icon name="check" cls="w-10 h-10 text-green-600" />
        </div>
        <h2 style={{ fontFamily: "'Georgia', serif", color: "#1a2e1a", fontSize: 26 }} className="font-bold mb-2">Order Placed!</h2>
        <p style={{ color: "#6b7280" }} className="text-sm mb-6">Your order will arrive in 15–20 minutes during peak campus hours.</p>
        <button onClick={() => { setPlaced(false); setPage("orders"); }} style={{ background: "#1a6b3a", borderRadius: 12 }} className="px-8 py-3 text-white font-semibold hover:bg-green-700 transition-colors">
          Track Order
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ background: "#f7f9f5", minHeight: "calc(100vh - 57px)" }} className="p-8">
      <div className="max-w-5xl mx-auto">
        <h1 style={{ fontFamily: "'Georgia', serif", color: "#1a2e1a", fontSize: 32 }} className="font-bold mb-1 flex items-center gap-2">
          Your Cart 🛒
        </h1>
        <p style={{ color: "#9ca3af" }} className="text-sm mb-8">Review your order before placing</p>

        {cart.length === 0 ? (
          <div className="text-center py-20">
            <p style={{ color: "#9ca3af" }} className="text-lg mb-4">Your cart is empty</p>
            <button onClick={() => setPage("menu")} style={{ background: "#1a6b3a", borderRadius: 12 }} className="px-8 py-3 text-white font-semibold hover:bg-green-700 transition-colors">Browse Menu</button>
          </div>
        ) : (
          <div className="flex gap-8">
            {/* Items */}
            <div className="flex-1 space-y-4">
              {cart.map(item => (
                <div key={item.id} style={{ background: "#fff", border: "1px solid #e8ede8", borderRadius: 16 }} className="flex items-center gap-5 p-5">
                  <img src={item.img} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                  <div className="flex-1">
                    <p style={{ fontFamily: "'Georgia', serif", color: "#1a2e1a" }} className="font-semibold text-base">{item.name}</p>
                    <p style={{ color: "#9ca3af" }} className="text-xs mt-0.5 line-clamp-2">{item.desc}</p>
                    <button onClick={() => removeItem(item.id)} style={{ color: "#ef4444" }} className="text-xs font-semibold mt-2 hover:underline">REMOVE</button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.id, -1)} style={{ background: "#f0f7f2", border: "1px solid #b8dfc8", borderRadius: 8 }} className="w-8 h-8 flex items-center justify-center hover:bg-green-100 transition-colors">
                      <Icon name="minus" cls="w-3 h-3 text-green-700" />
                    </button>
                    <span style={{ color: "#1a2e1a" }} className="font-bold w-5 text-center">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} style={{ background: "#1a6b3a", borderRadius: 8 }} className="w-8 h-8 flex items-center justify-center text-white hover:bg-green-700 transition-colors">
                      <Icon name="plus" cls="w-3 h-3" />
                    </button>
                  </div>
                  <span style={{ color: "#1a6b3a", minWidth: 60 }} className="font-bold text-lg text-right">₹{(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}

              {/* Perks */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div style={{ background: "#e6f4ec", border: "1px solid #b8dfc8", borderRadius: 14 }} className="flex items-center gap-3 p-4">
                  <div style={{ background: "#1a6b3a" }} className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold">✦</div>
                  <div>
                    <p style={{ color: "#1a6b3a" }} className="text-xs font-bold">Campus Points</p>
                    <p style={{ color: "#1a6b3a" }} className="text-xs">You're earning 37 pts on this order</p>
                  </div>
                </div>
                <div style={{ background: "#e6f4ec", border: "1px solid #b8dfc8", borderRadius: 14 }} className="flex items-center gap-3 p-4">
                  <div style={{ background: "#1a6b3a" }} className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs">🚚</div>
                  <div>
                    <p style={{ color: "#1a6b3a" }} className="text-xs font-bold">Free Delivery</p>
                    <p style={{ color: "#1a6b3a" }} className="text-xs">Spend ₹5 more for zero fees</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div style={{ width: 300 }} className="flex-shrink-0">
              <div style={{ background: "#fff", border: "1px solid #e8ede8", borderRadius: 16 }} className="p-6">
                <h3 style={{ fontFamily: "'Georgia', serif", color: "#1a2e1a" }} className="font-bold text-lg mb-5">Order Summary</h3>
                <div className="space-y-3 text-sm" style={{ color: "#6b7280" }}>
                  <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Taxes</span><span>₹{tax.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Delivery Fee</span><span>₹{delivery.toFixed(2)}</span></div>
                  <div style={{ borderTop: "2px solid #e8ede8", color: "#1a2e1a" }} className="flex justify-between font-bold text-base pt-3 mt-2">
                    <span>Total Amount</span><span style={{ color: "#1a6b3a" }}>₹{total.toFixed(2)}</span>
                  </div>
                </div>
                <div style={{ border: "1px solid #e8ede8", borderRadius: 10 }} className="flex mt-5">
                  <input placeholder="Promo code" className="flex-1 px-3 py-2 text-sm outline-none bg-transparent" style={{ color: "#374151" }} />
                  <button style={{ background: "#1a6b3a", borderRadius: "0 10px 10px 0", color: "#fff" }} className="px-4 text-sm font-bold">APPLY</button>
                </div>
                <button onClick={() => { setPlaced(true); setCart([]); }} style={{ background: "#1a6b3a", borderRadius: 12 }} className="w-full mt-5 py-3.5 text-white font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                  Place Order <Icon name="arrow" cls="w-4 h-4" />
                </button>
                <div className="flex items-center justify-center gap-4 mt-3">
                  <span style={{ color: "#9ca3af" }} className="text-xs flex items-center gap-1">🔒 Secure</span>
                  <span style={{ color: "#9ca3af" }} className="text-xs flex items-center gap-1">🌿 Organic</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── ORDERS PAGE ─────────────────────────────────────────────────────────────
const OrdersPage = () => {
  const [filter, setFilter] = useState("All");
  const [orders, setOrders] = useState(initialOrders);

  const filtered = filter === "All" ? orders : filter === "Active" ? orders.filter(o => o.status !== "COMPLETED") : orders.filter(o => o.status === "COMPLETED");
  const statusColor = { PREPARING: "#f59e0b", READY: "#10b981", COMPLETED: "#9ca3af" };
  const statusBg = { PREPARING: "#fef3c7", READY: "#d1fae5", COMPLETED: "#f3f4f6" };

  return (
    <div style={{ background: "#f7f9f5", minHeight: "calc(100vh - 57px)" }} className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 style={{ fontFamily: "'Georgia', serif", color: "#1a2e1a", fontSize: 32 }} className="font-bold mb-1">Your Orders</h1>
        <p style={{ color: "#9ca3af" }} className="text-sm mb-8">Track and manage your recent orders across campus.</p>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div style={{ width: 200 }} className="flex-shrink-0 space-y-4">
            <div style={{ background: "#fff", border: "1px solid #e8ede8", borderRadius: 14 }} className="p-4">
              <p style={{ color: "#9ca3af", letterSpacing: "0.08em" }} className="text-xs font-semibold mb-3">SUMMARY</p>
              <div style={{ borderBottom: "1px solid #e8ede8" }} className="flex justify-between py-2">
                <span style={{ color: "#6b7280" }} className="text-sm">Active Orders</span>
                <span style={{ background: "#1a6b3a", color: "#fff" }} className="text-xs font-bold px-2 rounded-full">{orders.filter(o => o.status !== "COMPLETED").length}</span>
              </div>
              <div className="flex justify-between py-2">
                <span style={{ color: "#6b7280" }} className="text-sm">Completed</span>
                <span style={{ color: "#9ca3af" }} className="text-sm font-semibold">148</span>
              </div>
            </div>
            <div style={{ background: "#fff", border: "1px solid #e8ede8", borderRadius: 14 }} className="p-4">
              <p style={{ color: "#9ca3af", letterSpacing: "0.08em" }} className="text-xs font-semibold mb-3">QUICK FILTERS</p>
              <div className="flex flex-wrap gap-2">
                {["All", "Active", "History"].map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    style={{ background: filter === f ? "#1a6b3a" : "#f0f7f2", color: filter === f ? "#fff" : "#1a6b3a", border: "1px solid #b8dfc8", borderRadius: 20 }}
                    className="text-xs font-semibold px-3 py-1">
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="flex-1 space-y-4">
            {filtered.map(order => (
              <div key={order.id} style={{ background: "#fff", border: "1px solid #e8ede8", borderRadius: 16 }} className="flex items-center gap-5 p-5 hover:shadow-md transition-shadow">
                <img src={order.img} className="w-24 h-20 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ color: "#9ca3af" }} className="text-xs font-mono">ORDER #{order.id}</span>
                    <span style={{ background: statusBg[order.status], color: statusColor[order.status] }} className="text-xs font-bold px-2 py-0.5 rounded-full">{order.status}</span>
                  </div>
                  <p style={{ fontFamily: "'Georgia', serif", color: "#1a2e1a" }} className="font-semibold text-lg">{order.name}</p>
                  <p style={{ color: "#9ca3af" }} className="text-xs mt-0.5">{order.desc}</p>
                  <div className="flex gap-3 mt-3">
                    <button style={{ background: "#1a6b3a", borderRadius: 8, color: "#fff" }} className="text-xs font-bold px-4 py-1.5 hover:bg-green-700 transition-colors">Reorder</button>
                    <button style={{ background: "#f0f7f2", border: "1px solid #b8dfc8", borderRadius: 8, color: "#1a6b3a" }} className="text-xs font-bold px-4 py-1.5 hover:bg-green-100 transition-colors">View Details</button>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p style={{ color: "#1a6b3a", fontFamily: "'Georgia', serif" }} className="font-bold text-xl">₹{order.price}</p>
                  <p style={{ color: "#9ca3af" }} className="text-xs mt-1">{order.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── INSIGHTS PAGE ───────────────────────────────────────────────────────────
const InsightsPage = () => {
  const weekData = [
    { day: "MON", val: 30 }, { day: "TUE", val: 55 }, { day: "WED", val: 90 },
    { day: "THU", val: 70 }, { day: "FRI", val: 80 }, { day: "SAT", val: 45 }, { day: "SUN", val: 35 },
  ];
  const maxVal = Math.max(...weekData.map(d => d.val));
  const spending = [
    { label: "Dosa & South Indian", pct: 45, color: "#1a6b3a" },
    { label: "Bowls & Salads", pct: 30, color: "#2d9d5c" },
    { label: "Beverages", pct: 25, color: "#86efac" },
  ];
  const nutrition = [
    { label: "CALORIES", pct: 78, color: "#1a6b3a" },
    { label: "PROTEIN", pct: 90, color: "#2d9d5c" },
    { label: "CARBS", pct: 100, color: "#f59e0b" },
    { label: "FAT", pct: 42, color: "#ef4444" },
  ];
  const topFavs = [
    { name: "Masala Dosa", sub: "Ordered 12 times", price: "₹4.50", img: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=60&q=80" },
    { name: "QuinoBowl", sub: "Ordered 8 times", price: "₹8.20", img: menuItems[0].img },
    { name: "ColdBrew", sub: "Ordered 6 times", price: "₹3.50", img: menuItems[7].img },
  ];

  const CircleChart = ({ pct, color, label }) => {
    const r = 28; const circ = 2 * Math.PI * r;
    const filled = (pct / 100) * circ;
    return (
      <div className="flex flex-col items-center gap-1">
        <svg width="70" height="70" viewBox="0 0 70 70">
          <circle cx="35" cy="35" r={r} fill="none" stroke="#e8ede8" strokeWidth="6" />
          <circle cx="35" cy="35" r={r} fill="none" stroke={color} strokeWidth="6" strokeDasharray={`${filled} ${circ}`} strokeLinecap="round" transform="rotate(-90 35 35)" />
          <text x="35" y="40" textAnchor="middle" fill="#1a2e1a" fontSize="13" fontWeight="700">{pct}%</text>
        </svg>
        <span style={{ color: "#9ca3af", letterSpacing: "0.06em" }} className="text-xs font-semibold">{label}</span>
      </div>
    );
  };

  return (
    <div style={{ background: "#f7f9f5", minHeight: "calc(100vh - 57px)" }} className="p-8">
      <div className="max-w-5xl mx-auto">
        <h1 style={{ fontFamily: "'Georgia', serif", color: "#1a2e1a", fontSize: 32 }} className="font-bold mb-1 flex items-center gap-2">
          Insights Dashboard 📊
        </h1>
        <p style={{ color: "#9ca3af" }} className="text-sm mb-8">Track your spending, orders, and nutrition</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "TOTAL SPENDING", val: "₹248.50", sub: "+12%", subColor: "#10b981" },
            { label: "TOTAL ORDERS", val: "42", sub: "+3", subColor: "#10b981" },
            { label: "AVG ORDER", val: "₹5.90", sub: "Daily", subColor: "#9ca3af" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid #e8ede8", borderRadius: 14 }} className="p-5">
              <p style={{ color: "#9ca3af", letterSpacing: "0.08em" }} className="text-xs font-semibold mb-2">{s.label}</p>
              <div className="flex items-baseline gap-2">
                <span style={{ fontFamily: "'Georgia', serif", color: "#1a2e1a", fontSize: 28 }} className="font-bold">{s.val}</span>
                <span style={{ color: s.subColor, background: s.subColor + "20" }} className="text-xs font-bold px-2 py-0.5 rounded-full">{s.sub}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Weekly Activity */}
          <div style={{ background: "#fff", border: "1px solid #e8ede8", borderRadius: 16 }} className="col-span-2 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 style={{ fontFamily: "'Georgia', serif", color: "#1a2e1a" }} className="font-bold text-lg">Weekly Activity</h3>
              <span style={{ background: "#1a6b3a", color: "#fff" }} className="text-xs font-bold px-3 py-1 rounded-full">● ORDERS</span>
            </div>
            <div className="flex items-end gap-3 h-36">
              {weekData.map(d => (
                <div key={d.day} className="flex flex-col items-center gap-2 flex-1">
                  <div style={{ height: `${(d.val / maxVal) * 120}px`, background: "linear-gradient(to top, #1a6b3a, #4ade80)", borderRadius: "6px 6px 0 0", minHeight: 8 }} className="w-full transition-all hover:opacity-80 cursor-pointer" />
                  <span style={{ color: "#9ca3af" }} className="text-xs">{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Spending Analysis */}
          <div style={{ background: "#fff", border: "1px solid #e8ede8", borderRadius: 16 }} className="p-6">
            <h3 style={{ fontFamily: "'Georgia', serif", color: "#1a2e1a" }} className="font-bold text-lg mb-5">Spending Analysis</h3>
            <div className="space-y-4">
              {spending.map(s => (
                <div key={s.label}>
                  <div className="flex justify-between text-xs mb-1" style={{ color: "#6b7280" }}>
                    <span>{s.label}</span><span className="font-bold">{s.pct}%</span>
                  </div>
                  <div style={{ background: "#f0f7f2", borderRadius: 6, height: 8 }} className="w-full overflow-hidden">
                    <div style={{ width: `${s.pct}%`, background: s.color, height: "100%", borderRadius: 6, transition: "width 1s ease" }} />
                  </div>
                </div>
              ))}
            </div>
            <button style={{ background: "#1a6b3a", borderRadius: 10 }} className="w-full mt-5 py-2.5 text-white text-sm font-bold hover:bg-green-700 transition-colors">View Detailed Report</button>
            
            <h3 style={{ fontFamily: "'Georgia', serif", color: "#1a2e1a" }} className="font-bold text-base mt-6 mb-3">Top Favorites</h3>
            <div className="space-y-3">
              {topFavs.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <img src={f.img} className="w-9 h-9 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p style={{ color: "#1a2e1a" }} className="text-xs font-semibold truncate">{f.name}</p>
                    <p style={{ color: "#9ca3af" }} className="text-xs">{f.sub}</p>
                  </div>
                  <span style={{ color: "#1a6b3a" }} className="text-xs font-bold">{f.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Nutrition */}
        <div style={{ background: "#fff", border: "1px solid #e8ede8", borderRadius: 16 }} className="p-6 mt-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 style={{ fontFamily: "'Georgia', serif", color: "#1a2e1a" }} className="font-bold text-lg">Nutrition Summary</h3>
              <p style={{ color: "#9ca3af" }} className="text-xs mt-0.5">You are on track with your protein goals this week! Keep it up.</p>
              <span style={{ background: "#e6f4ec", color: "#1a6b3a", border: "1px solid #b8dfc8" }} className="text-xs font-bold px-3 py-0.5 rounded-full mt-2 inline-block">DAILY AVG: 2,100 KCAL</span>
            </div>
          </div>
          <div className="flex gap-10 justify-around">
            {nutrition.map(n => <CircleChart key={n.label} pct={n.pct} color={n.color} label={n.label} />)}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [cart, setCart] = useState([]);

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  // Build resolved menu: prefer local asset images when available.
  const resolvedMenu = [...menuItems].map(m => ({ ...m, img: findAssetFor(m.name) || m.img }));

  // Add any standalone asset files as new menu items (if they don't match existing names)
  const existingKeys = new Set(resolvedMenu.map(m => normalizeKey(m.name)));
  let nextId = Math.max(...resolvedMenu.map(m => (Number(m.id) || 0))) + 1;
  const humanize = s => s.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  for (const p in assetModules) {
    const filename = p.split('/').pop();
    const base = filename.replace(/\.[^/.]+$/, '');
    const key = normalizeKey(base);
    if (!existingKeys.has(key)) {
      resolvedMenu.push({ id: nextId++, name: humanize(base), category: 'Snacks', price: 30.00, calories: 250, tags: ['NEW'], img: assetModules[p], desc: 'From local assets' });
      existingKeys.add(key);
    }
  }

  return (
    <div style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", background: "#f7f9f5" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #f0f7f2; }
        ::-webkit-scrollbar-thumb { background: #1a6b3a; border-radius: 4px; }
      `}</style>
      <Navbar page={page} setPage={setPage} cartCount={cartCount} />
      {page === "home" && <HomePage setPage={setPage} cart={cart} addToCart={addToCart} menuItems={resolvedMenu} />}
      {page === "menu" && <MenuPage menuItems={resolvedMenu} cart={cart} addToCart={addToCart} setPage={setPage} />}
      {page === "cart" && <CartPage cart={cart} setCart={setCart} setPage={setPage} />}
      {page === "orders" && <OrdersPage />}
      {page === "insights" && <InsightsPage />}
    </div>
  );
}
