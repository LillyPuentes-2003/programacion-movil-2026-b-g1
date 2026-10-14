// Semana 7 · Kotlin básico: clase Producto con validación y null-safety.
// Ejecutar: pegar en https://play.kotlinlang.org y pulsar Run,
// o compilar con: kotlinc Producto.kt -include-runtime -d producto.jar && java -jar producto.jar

class Producto(nombre: String, precio: Double, val descripcion: String? = null) {

    // val = solo lectura: una vez creado, el producto no cambia de nombre ni de precio.
    val nombre: String = nombre.trim()
    val precio: Double = precio

    init {
        // require lanza IllegalArgumentException si la condición no se cumple.
        require(this.nombre.isNotEmpty()) { "El nombre no puede estar vacío" }
        require(precio >= 0) { "El precio debe ser mayor o igual a 0 (llegó $precio)" }
    }

    // descripcion es String? (puede ser null): ?: da un valor por defecto si es null.
    fun resumen(): String =
        "$nombre — $${"%,.0f".format(precio)} — ${descripcion ?: "sin descripción"}"

    companion object {
        // Versión segura: en vez de lanzar excepción, devuelve null si los datos no son válidos.
        fun crearOrNull(nombre: String?, precio: Double?, descripcion: String? = null): Producto? {
            if (nombre.isNullOrBlank() || precio == null || precio < 0) return null
            return Producto(nombre, precio, descripcion)
        }
    }
}

fun main() {
    // 1. Productos válidos
    val esmalte = Producto("Esmalte semipermanente", 25000.0, "Color rojo cereza")
    val lima = Producto("Lima de uñas", 3500.0) // descripcion queda en null
    println(esmalte.resumen())
    println(lima.resumen())

    // 2. Manejo de nulos con ?. y ?:
    println("Largo de la descripción de la lima: ${lima.descripcion?.length ?: 0}")

    // 3. Validación: precio negativo → excepción controlada
    try {
        Producto("Producto con error", -500.0)
    } catch (e: IllegalArgumentException) {
        println("No se creó el producto: ${e.message}")
    }

    // 4. Creación segura que devuelve null en vez de fallar
    val sinNombre = Producto.crearOrNull(null, 1000.0)
    val sinPrecio = Producto.crearOrNull("Algodón", null)
    val valido = Producto.crearOrNull("Acetona", 8000.0)
    println("Sin nombre → $sinNombre")
    println("Sin precio → $sinPrecio")
    println("Válido → ${valido?.resumen()}")
}
