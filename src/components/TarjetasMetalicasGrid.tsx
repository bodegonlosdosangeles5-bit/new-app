import { motion } from "framer-motion"

export default function TarjetasMetalicasGrid() {
  const tarjetas = [
    { titulo: "Gestión de Inventario", texto: "Controlá tus productos y exportá reportes en PDF." },
    { titulo: "Producción", texto: "Supervisá tus lotes, materias primas y tiempos de elaboración." },
    { titulo: "Ventas", texto: "Monitoreá tus pedidos y clientes desde un solo lugar." },
    { titulo: "Depósito", texto: "Organizá los pasillos, racks y niveles de almacenamiento." },
    { titulo: "Formulaciones", texto: "Crea, edita y guarda tus fórmulas químicas fácilmente." },
    { titulo: "Reportes", texto: "Generá informes descargables en PDF con un clic." },
  ]

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-10">
      <h2 className="text-3xl font-bold text-yellow-400 mb-10">Panel de Control</h2>
      
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl">
        {tarjetas.map((card, i) => (
          <TarjetaMetalica key={i} titulo={card.titulo} texto={card.texto} />
        ))}
      </div>

      {/* Botón general */}
      <motion.button
        whileHover={{
          scale: 1.1,
        }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 250, damping: 15 }}
        className="mt-12 px-8 py-3 bg-yellow-500 text-black font-semibold rounded-xl 
                   shadow-md transition-all duration-300 ease-in-out
                   hover:bg-yellow-400 hover:scale-110 hover:shadow-lg hover:shadow-yellow-500/40"
      >
        Crear nuevo registro
      </motion.button>
    </div>
  )
}

interface TarjetaMetalicaProps {
  titulo: string
  texto: string
}

function TarjetaMetalica({ titulo, texto }: TarjetaMetalicaProps) {
  return (
    <motion.div
      whileHover={{
        scale: 1.05,
      }}
      transition={{ type: "spring", stiffness: 200, damping: 10 }}
      className="bg-white/10 backdrop-blur-md rounded-2xl 
                 p-8 text-center shadow-md cursor-pointer
                 transition-all duration-300 ease-in-out
                 hover:shadow-xl hover:scale-105 hover:border hover:border-yellow-400/60 hover:bg-white/20"
    >
      <h3 className="text-yellow-400 text-xl font-semibold mb-3">{titulo}</h3>
      <p className="text-gray-300">{texto}</p>
    </motion.div>
  )
}
