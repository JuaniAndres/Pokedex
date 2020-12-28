const width = 800
const height = 600
const width2 = 760
const height2 = 800
const p_width = 120  //pokedex
const p_height = 125
const c_width = 650 //information card
const c_height = 300
const card_circle_radius = 120
const pokemon_polygon_radius = card_circle_radius - 20
const pokemon_card_separation = c_height + 100
const pokemon_circ_sep = 20

let selected = []

const margin = {
    top: 80,
    left: 30,
    right: 20,
    bottom: 90,
}

const svg_1 = d3.select("#vis1")
    .append("svg")
    .attr("class", "plot")
    .attr("width", width)
    .attr("height", height)

svg_1.append("text") //titulo barplot
    .attr("x", width / 2)
    .attr("y", 30)
    .attr("font-size", 30)
    .attr("text-anchor", "middle")
    .text("Amount of pokemons by type")

const svg_2 = d3.select("#vis2")
    .append("svg")
    .attr("width", width2)
    .attr("height", height2)

// main corazon
const love = svg_2.append("path").attr("d", "M23.6,0c-3.4,0-6.3,2.7-7.6,5.6C14.7,2.7,11.8,0,8.4,0C3.8,0,0,3.8,0,8.4c0,9.4,9.5,11.9,16,21.2\n" +
    "  c6.1-9.3,16-12.1,16-21.2C32,3.8,28.2,0,23.6,0z")
    .attr("fill", "transparent")
    .attr("transform", "translate(350,380) scale(1.5,1.5)")
    .attr("stroke", "transparent")
const afinity_box = svg_2.append("rect")
    .attr("x",410)
    .attr("y",390)
    .attr("width",90)
    .attr("height",20)
    .attr("fill","transparent")
    .attr("stroke","transparent")
    .attr("stroke-width",1)
const afinity_group_text = svg_2.append("text")
    .attr("x",414)
    .attr("y",405)
    .attr("fill","transparent")
    .attr("font-size","15")
    .text("")

//legend corazon
svg_2.append("path").attr("d", "M23.6,0c-3.4,0-6.3,2.7-7.6,5.6C14.7,2.7,11.8,0,8.4,0C3.8,0,0,3.8,0,8.4c0,9.4,9.5,11.9,16,21.2\n" +
    "  c6.1-9.3,16-12.1,16-21.2C32,3.8,28.2,0,23.6,0z")
    .attr("fill", "red")
    .attr("transform", `translate(300,${height2 - 25}) scale(0.75,0.75)`)
    .attr("stroke", "black")

svg_2.append("text")
    .attr("stroke", "black")
    .attr("x", 325)
    .attr("y", height2 - 10)
    .text(": Means can breed")

const contenedorEjeY = svg_1
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

const contenedorEjeX = svg_1
    .append("g")
    .attr("transform", `translate(${margin.left}, ${height - margin.bottom})`);

const contenedorBarras = svg_1
    .append("g")
    .attr("transform", `translate(${margin.left} ${margin.top})`);

const pokedex = d3.select("#pokedex")

const sidenav = d3.select(".sidenav")

d3.csv("pokedex.csv", row => {
    return {
        ...row,
        height_m: +row.height_m,
        weight_kg: +row.weight_kg,
        total_points: +row.total_points,
        hp: +row.hp,
        attack: +row.attack,
        defense: +row.defense,
        sp_attack: +row.sp_attack,
        sp_defense: +row.sp_defense,
        speed: +row.speed,
        catch_rate: +row.catch_rate,
        egg_cycles: +row.egg_cycles
    }
}).then((data) => {
    pokemon_by_type1 = d3.group(data, d => d.type_1)
    pokemon_by_type2 = d3.group(data, d => d.type_2)
    pokemon_by_type2.delete("")
    let pokemon_by_type = new Map()
    for (const type of pokemon_by_type1.keys()) {
        pokemon_by_type.set(type, pokemon_by_type1.get(type).concat(pokemon_by_type2.get(type)))
    }
    let pokemon_type_by_gen = new Map()
    let pokemon_by_gen = d3.group(data, d => d.generation)

    pokemon_by_gen_type1 = d3.group(data, d => d.generation, d => d.type_1)
    pokemon_by_gen_type2 = d3.group(data, d => d.generation, d => d.type_2)
    for (let gen of pokemon_by_gen.keys()) {
        pokemon_type_by_gen.set(gen, new Map())
        for (const type of pokemon_by_type1.keys()) {
            array1 = pokemon_by_gen_type1.get(gen).get(type)
            array2 = pokemon_by_gen_type2.get(gen).get(type)
            if (array1 == null) {
                array1 = []
            }
            if (array2 == null) {
                array2 = []
            }
            pokemon_type_by_gen.get(gen).set(type, array1.concat(array2))
        }
    }
    let gen_change = function () {
        let new_gen = d3.select(this).property("value")
        if (new_gen === "all") {
            actualizar_barras_type(pokemon_by_type)
        } else {
            actualizar_barras_type(pokemon_type_by_gen.get(new_gen))
        }
    }
    let gen_dropdown = d3.select("#vis1")
        .insert("select", "svg")
        .on("change", gen_change)

    gen_dropdown.append("option").attr("value", "all").text("All generations")
    gen_dropdown.selectAll("options")
        .data(Array.from(pokemon_type_by_gen.keys()).sort())
        .enter().append("option")
        .attr("value", d => d).text(d => `Generation ${d}`)

    let filter = function () {
        const new_gen = gen_filter_pokedex.property("value")
        const new_type = type_filter_pokedex.property("value")

        if (new_gen === "all" && new_type === "all") {
            actualizar_pokedex(data)
        } else if (new_type === "all") {
            actualizar_pokedex(pokemon_by_gen.get(new_gen))
        } else if (new_gen === "all") {
            actualizar_pokedex(pokemon_by_type.get(new_type))
        } else {
            actualizar_pokedex(pokemon_type_by_gen.get(new_gen).get(new_type))
        }
        marcar_selected(selected)
    }
    const pokedex_filters = sidenav.append("div").attr("class", "center")

    let gen_filter_pokedex = pokedex_filters
        .append("select")
        .on("change", filter)

    gen_filter_pokedex.append("option").attr("value", "all").text("All generations")
    gen_filter_pokedex.selectAll("options")
        .data(Array.from(pokemon_type_by_gen.keys()).sort())
        .enter().append("option")
        .attr("value", d => d).text(d => `Generación ${d}`)

    let type_filter_pokedex = pokedex_filters
        .append("select")
        .on("change", filter)

    type_filter_pokedex.append("option").attr("value", "all").text("All types")
    type_filter_pokedex.selectAll("options")
        .data(pokemon_by_type.keys())
        .enter().append("option")
        .attr("value", d => d).text(d => `${d}`)

    let boton_reset = pokedex_filters.append("button")
        .text("Reset")
        .on("click", restart)

    function restart() {

            actualizar_detalle_pokemon([])
            gen_filter_pokedex.property("value", "all")
            type_filter_pokedex.property("value", "all")
            actualizar_pokedex(data)
            hide_heart()
            for (let index in selected) {
                pokedex.select(`[id="${selected[index].id}"]`)
                    .attr("class", "card")
            }
            selected = []

    }

    actualizar_barras_type(pokemon_by_type)
    actualizar_pokedex(data)
    actualizar_detalle_pokemon([])
})


function actualizar_barras_type(datos) {
    const maximaFrecuencia = d3.max(datos, (d) => d[1].length)

    const escalaAltura = d3
        .scaleLinear()
        .domain([0, maximaFrecuencia])
        .range([0, height - margin.top - margin.bottom]);

    const escalaY = d3
        .scaleLinear()
        .domain([0, maximaFrecuencia])
        .range([height - margin.top - margin.bottom, 0]);

    const ejeY = d3.axisLeft(escalaY);

    contenedorEjeY
        .transition()
        .duration(1000)
        .call(ejeY)
        .selection()
        .selectAll("line")
        .attr("x1", width - margin.right - margin.left)
        .attr("stroke-dasharray", "5")
        .attr("opacity", 0.5);

    const escalaX = d3
        .scaleBand()
        .domain(datos.keys())
        .rangeRound([0, width - margin.right - margin.left])
        .padding(0.5);

    const ejeX = d3.axisBottom(escalaX);

    contenedorEjeX
        .transition()
        .duration(1000)
        .call(ejeX)
        .selection()
        .selectAll("text")
        .attr("font-size", 20)
        .attr("transform", "translate(-20,50) rotate(270)")

    contenedorBarras
        .selectAll("rect")
        .data(datos, (d) => d[0])
        .join(
            (enter) =>
                enter
                    .append("rect")
                    .attr("fill", "black")
                    .attr("y", height - margin.top - margin.bottom)
                    .attr("x", (d) => escalaX(d[0]))
                    .attr("width", escalaX.bandwidth())
                    .attr("height", 0)
                    .transition()
                    .duration(1000)
                    .attr("height", (d) => escalaAltura(d[1].length))
                    .attr("y", (d) => escalaY(d[1].length))
                    .selection(),
            (update) =>
                update
                    .transition()
                    .duration(1000)
                    .attr("height", (d) => escalaAltura(d[1].length))
                    .attr("y", (d) => escalaY(d[1].length))
                    .attr("x", (d) => escalaX(d[0]))
                    .attr("width", escalaX.bandwidth())
                    .selection(),
            (exit) =>
                exit
                    .transition()
                    .duration(500)
                    .attr("y", height - margin.top - margin.bottom)
                    .attr("height", 0)
                    .remove()
        )
}

function actualizar_pokedex(datos) {
    const clicked = (e, d) => {
        check = selected.find(element => element.id === d.id)
        if (check == null) {
            if (selected.length < 2) {
                selected.push(d)
                select(d, selected)
            }
        } else {
            selected.splice(selected.findIndex(element => element.id === d.id), 1)
            deselect(check, selected)

        }
    }
    pokedex.selectAll(".card_div")
        .data(datos, (d) => d.name)
        .join(
            (enter) => {
                const div = enter.append("div")
                    .attr("class", "card_div")
                const pokemon = div.append("svg")
                    .attr("class", "card")
                    .attr("id", d => d.id)
                    .attr("width", 0)
                    .attr("height", 0)
                    .transition()
                    .duration(1500)
                    .attr("height", p_height)
                    .attr("width", p_width)
                    .selection()
                    .on("click", clicked)
                pokemon.append("image")
                    .attr("x", 10)
                    .attr("y", 0)
                    .attr("width", p_width - 20)
                    .attr("height", p_height - 30)
                    .attr("href", d => d.url)
                pokemon.append("text")
                    .attr("y", p_height - 18)
                    .attr("x", p_width / 2)
                    .attr("text-anchor", "middle")
                    .attr("font-size", 14)
                    .text(d => d.name.split(" ").slice(0, 2).join(" "))
                pokemon.append("text")
                    .attr("y", p_height - 5)
                    .attr("x", p_width / 2)
                    .attr("text-anchor", "middle")
                    .attr("font-size", 14)
                    .text(d => d.name.split(" ").slice(2).join(" "))

            },
            (update) =>
                update,
            (exit) =>
                exit.remove()
        )
}

function actualizar_detalle_pokemon(datos) {
    const Scale = d3.scaleLinear([1, 255], [0, pokemon_polygon_radius])
    const Color_Scale = d3.scaleOrdinal(["0.25", "0.5", "0.0", "1.0", "2.0", "4.0"], ["#364b9a", "#6ea6cd", "#eaeccc", "#feda8b", "#f67e4b", "#a50026"])
    const cx = c_width - card_circle_radius
    const cy = c_height / 2 + 50

    const clicked = (e, d) => {
        check = selected.find(element => element.id === d.id)
        selected.splice(selected.findIndex(element => element.id === d.id), 1)
        deselect(check, selected)
    }

    svg_2.selectAll("g")
        .data(datos, (d) => d.name)
        .join(
            (enter) => {
                const g = enter.append("g").attr("pos", (_, i) => i).on("dblclick", clicked)
                g.append("rect")
                    .attr("class", "card")
                    .attr("width", 0)
                    .attr("height", c_height)
                    .attr("x", 50)
                    .attr("y", (_, i) => 50 + pokemon_card_separation * i)
                    .attr("fill", "white")
                    .attr("stroke", "black")
                    .transition()
                    .duration(1500)
                    .attr("width", c_width)
                    .selection()

                g.append("image")
                    .attr("x", 60)
                    .attr("y", (_, i) => 60 + pokemon_card_separation * i)
                    .attr("width", 0)
                    .attr("height", c_height / 2)
                    .attr("href", d => d.url)
                    .transition()
                    .delay(600)
                    .duration(1500)
                    .attr("width", c_height / 2)
                    .selection()

                g.append("text")  //Nombre
                    .attr("y", (_, i) => 110 + pokemon_card_separation * i)
                    .attr("x", c_height / 2 + 70)
                    .attr("font-size", 0)
                    .text(d => d.name)
                    .transition()
                    .delay(600)
                    .duration(1500)
                    .attr("font-size", 20)
                    .selection()

                g.append("text") //Especie
                    .attr("y", (_, i) => 135 + pokemon_card_separation * i)
                    .attr("x", c_height / 2 + 70)
                    .attr("font-size", 0)
                    .text(d => d.species)
                    .transition()
                    .delay(600)
                    .duration(1500)
                    .attr("font-size", 18)
                    .selection()

                g.append("image") //tipo1
                    .attr("y", (_, i) => 145 + pokemon_card_separation * i)
                    .attr("x", c_height / 2 + 70)
                    .attr("width", 0)
                    .attr("height", 20)
                    .attr("href", d => `https://www.serebii.net/pokedex-bw/type/${d.type_1.toLowerCase()}.gif`)
                    .transition()
                    .delay(600)
                    .duration(1500)
                    .attr("width", 50)
                    .selection()
                g.append("image") //tipo2
                    .attr("y", (_, i) => 145 + pokemon_card_separation * i)
                    .attr("x", c_height / 2 + 130)
                    .attr("width", 0)
                    .attr("height", 20)
                    .attr("href", d => type_2_url(d))
                    .transition()
                    .delay(600)
                    .duration(1500)
                    .attr("width", 50)
                    .selection()

                g.append("text")// altura
                    .attr("y", (_, i) => 185 + pokemon_card_separation * i)
                    .attr("x", c_height / 2 + 70)
                    .attr("font-size", 0)
                    .text(d => `HT: ${d.height_m} m`)
                    .transition()
                    .delay(600)
                    .duration(1500)
                    .attr("font-size", 18)
                    .selection()

                g.append("text") //peso
                    .attr("y", (_, i) => 185 + pokemon_card_separation * i)
                    .attr("x", c_height / 2 + 160)
                    .attr("font-size", 0)
                    .text(d => `WT: ${d.weight_kg} kg`)
                    .transition()
                    .delay(600)
                    .duration(1500)
                    .attr("font-size", 18)
                    .selection()

                g.append("text") //catch rate
                    .attr("y", (_, i) => 215 + pokemon_card_separation * i)
                    .attr("x", c_height / 2 + 70)
                    .attr("font-size", 0)
                    .text("Catch difficulty:")
                    .transition()
                    .delay(600)
                    .duration(1500)
                    .attr("font-size", 17)
                    .selection()

                g.append("text") //catchrate Value
                    .attr("y", (_, i) => 215 + pokemon_card_separation * i)
                    .attr("x", c_height / 2 + 190)
                    .attr("font-size", 0)
                    .text(d => calculate_dificulty_catch(d.catch_rate))
                    .transition()
                    .delay(600)
                    .duration(1500)
                    .attr("font-size", 18)
                    .selection()

                g.append("circle") // polygon circle
                    .attr("cx", cx + pokemon_circ_sep)
                    .attr("cy", (_, i) => cy + pokemon_card_separation * i)
                    .attr("r", card_circle_radius)
                    .attr("fill", "transparent")
                    .attr("stroke","transparent")
                    .transition()
                    .delay(700)
                    .duration(1500)
                    .attr("stroke", "black")
                    .attr("fill", "snow")
                    .selection()

                g.append("polygon") //stats polygon outter
                    .attr("points", (_, i) => `${570 + pokemon_circ_sep},${131 + pokemon_card_separation * i} ${490 + pokemon_circ_sep},${131 + pokemon_card_separation * i} ${450 + pokemon_circ_sep},${200 + pokemon_card_separation * i} ${490 + pokemon_circ_sep},${269 + pokemon_card_separation * i} ${570 + pokemon_circ_sep},${269 + pokemon_card_separation * i} ${610 + pokemon_circ_sep},${200 + pokemon_card_separation * i}`) //https://www.mathopenref.com/coordpolycalc.html
                    .attr("fill", "transparent")
                    .attr("stroke", "transparent")
                    .attr("stroke-width", "1")
                    .transition()
                    .delay(600)
                    .duration(1500)
                    .attr("stroke", "black")
                    .selection()

                g.append("polygon") //stats polygon inner
                    .attr("points", (d, i) => calcular_cordenada_poligono(
                        Scale(d.sp_attack), Scale(d.hp), Scale(d.attack), Scale(d.defense), Scale(d.speed), Scale(d.sp_defense),
                        cx + pokemon_circ_sep, cy + pokemon_card_separation * i))
                    .attr("fill", "transparent")
                    .transition()
                    .delay(900)
                    .duration(1500)
                    .attr("fill", "blue")
                    .selection()

                g.append("line") //polygon division line
                    .attr("x1", 570 + pokemon_circ_sep)
                    .attr("y1", (_, i) => 131 + pokemon_card_separation * i)
                    .attr("x2", 490 + pokemon_circ_sep)
                    .attr("y2", (_, i) => 269 + pokemon_card_separation * i)
                    .attr("stroke", "transparent")
                    .attr("stroke-width", 0.5)
                    .transition()
                    .delay(600)
                    .duration(1500)
                    .attr("stroke", "black")
                    .selection()
                g.append("line") //polygon division line
                    .attr("x1", 490 + pokemon_circ_sep)
                    .attr("y1", (_, i) => 131 + pokemon_card_separation * i)
                    .attr("x2", 570 + pokemon_circ_sep)
                    .attr("y2", (_, i) => 269 + pokemon_card_separation * i)
                    .attr("stroke", "transparent")
                    .attr("stroke-width", 0.5)
                    .transition()
                    .delay(600)
                    .duration(1500)
                    .attr("stroke", "black")
                    .selection()
                g.append("line") //polygon division line
                    .attr("x1", 450 + pokemon_circ_sep)
                    .attr("y1", (_, i) => 200 + pokemon_card_separation * i)
                    .attr("x2", 610 + pokemon_circ_sep)
                    .attr("y2", (_, i) => 200 + pokemon_card_separation * i)
                    .attr("stroke", "transparent")
                    .attr("stroke-width", 0.5)
                    .transition()
                    .delay(600)
                    .duration(1500)
                    .attr("stroke", "black")
                    .selection()

                g.append("text") //Hp text
                    .attr("x", 570 + 3 + pokemon_circ_sep)
                    .attr("y", (_, i) => 121 - 3 + pokemon_card_separation * i)
                    .attr("fill", "black")
                    .text("HP")
                    .attr("font-size", 0)
                    .transition()
                    .delay(600)
                    .duration(1500)
                    .attr("font-size", 10)
                    .selection()
                g.append("text") //Hp value
                    .attr("x", 570 + 3 + pokemon_circ_sep)
                    .attr("y", (_, i) => 131 - 3 + pokemon_card_separation * i)
                    .attr("fill", "black")
                    .text(d => d.hp)
                    .attr("font-size", 0)
                    .transition()
                    .delay(600)
                    .duration(1500)
                    .attr("font-size", 10)
                    .selection()

                g.append("text") //Atack text
                    .attr("x", 490 - 16 + pokemon_circ_sep)
                    .attr("y", (_, i) => 121 - 4 + pokemon_card_separation * i)
                    .attr("fill", "black")
                    .text("Attack")
                    .attr("font-size", 0)
                    .transition()
                    .delay(600)
                    .duration(1500)
                    .attr("font-size", 10)
                    .selection()
                g.append("text") //Atack value
                    .attr("x", 490 - 10 + pokemon_circ_sep)
                    .attr("y", (_, i) => 131 - 4 + pokemon_card_separation * i)
                    .attr("fill", "black")
                    .text(d => d.attack)
                    .attr("font-size", 0)
                    .transition()
                    .delay(600)
                    .duration(1500)
                    .attr("font-size", 10)
                    .selection()

                g.append("text") // Defense text
                    .attr("x", 450 - 35 + pokemon_circ_sep)
                    .attr("y", (_, i) => 190 + 3 + pokemon_card_separation * i)
                    .attr("fill", "black")
                    .text("Defense")
                    .attr("font-size", 0)
                    .transition()
                    .delay(600)
                    .duration(1500)
                    .attr("font-size", 10)
                    .selection()
                g.append("text") // Defense value
                    .attr("x", 450 - 12 + pokemon_circ_sep)
                    .attr("y", (_, i) => 200 + 3 + pokemon_card_separation * i)
                    .attr("fill", "black")
                    .text(d => d.defense)
                    .attr("font-size", 0)
                    .transition()
                    .delay(600)
                    .duration(1500)
                    .attr("font-size", 10)
                    .selection()

                g.append("text") //Speed text
                    .attr("x", 490 - 15 + pokemon_circ_sep)
                    .attr("y", (_, i) => 279 + 10 + pokemon_card_separation * i)
                    .attr("fill", "black")
                    .text("Speed")
                    .attr("font-size", 0)
                    .transition()
                    .delay(600)
                    .duration(1500)
                    .attr("font-size", 10)
                    .selection()
                g.append("text") //Speed value
                    .attr("x", 490 - 8 + pokemon_circ_sep)
                    .attr("y", (_, i) => 269 + 10 + pokemon_card_separation * i)
                    .attr("fill", "black")
                    .text(d => d.speed)
                    .attr("font-size", 0)
                    .transition()
                    .delay(600)
                    .duration(1500)
                    .attr("font-size", 10)
                    .selection()

                g.append("text") // sp def text
                    .attr("x", 570 - 4 + pokemon_circ_sep)
                    .attr("y", (_, i) => 279 + 10 + pokemon_card_separation * i)
                    .attr("fill", "black")
                    .text("SP.Def")
                    .attr("font-size", 0)
                    .transition()
                    .delay(600)
                    .duration(1500)
                    .attr("font-size", 10)
                    .selection()
                g.append("text") // sp def value
                    .attr("x", 570 - 2 + pokemon_circ_sep)
                    .attr("y", (_, i) => 269 + 10 + pokemon_card_separation * i)
                    .attr("fill", "black")
                    .text(d => d.sp_defense)
                    .attr("font-size", 0)
                    .transition()
                    .delay(600)
                    .duration(1500)
                    .attr("font-size", 10)
                    .selection()

                g.append("text") // sp atack text
                    .attr("x", 610 + 2 + pokemon_circ_sep)
                    .attr("y", (_, i) => 190 + 2 + pokemon_card_separation * i)
                    .attr("fill", "black")
                    .text("Sp. Atk")
                    .attr("font-size", 0)
                    .transition()
                    .delay(600)
                    .duration(1500)
                    .attr("font-size", 10)
                    .selection()
                g.append("text") // sp atack value
                    .attr("x", 610 + 2 + pokemon_circ_sep)
                    .attr("y", (_, i) => 200 + 3 + pokemon_card_separation * i)
                    .attr("fill", "black")
                    .text(d => d.sp_attack)
                    .attr("font-size", 0)
                    .transition()
                    .delay(600)
                    .duration(1500)
                    .attr("font-size", 10)
                    .selection()

                g.append("text") // Total stat points text
                    .attr("x", cx + pokemon_circ_sep)
                    .attr("y", (_, i) => cy - card_circle_radius + 25 + pokemon_card_separation * i)
                    .attr("fill", "black")
                    .text(d => `Total base points: ${d.total_points}`)
                    .attr("font-size", 0)
                    .attr("text-anchor", "middle")
                    .transition()
                    .delay(600)
                    .duration(1500)
                    .attr("font-size", 13)
                    .selection()

                g.append("text")  //weaaknes
                    .attr("x", c_height / 2 + 80)
                    .attr("y", (_, i) => 240 + pokemon_card_separation * i)
                    .attr("fill", "black")
                    .text("Weakness")
                    .attr("font-size", 0)
                    .attr("text-anchor", "middle")
                    .transition()
                    .delay(600)
                    .duration(1500)
                    .attr("font-size", 15)
                    .selection()
                const type_array = ["Normal", "Fire", "Water", "Electric", "Grass", "Ice", "Fight", "Poison", "Ground", "Flying", "Psychc", "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy"]
                const value_array = ["against_normal", "against_fire", "against_water", "against_electric", "against_grass", "against_ice", "against_fight", "against_poison", "against_ground", "against_flying", "against_psychic", "against_bug", "against_rock", "against_ghost", "against_dragon", "against_dark", "against_steel", "against_fairy"]
                const weakness_values = ["0.0", "0.25", "0.5", "1.0", "2.0", "4.0"]
                for (let indice = 0; indice < type_array.length; indice++) {
                    g.append("rect")
                        .attr("width", 20)
                        .attr("height", 50)
                        .attr("x", 60 + 20 * indice)
                        .attr("y", (_, i) => 250 + pokemon_card_separation * i)
                        .attr("fill", "transparent")
                        .attr("stroke", "transparent")
                        .transition()
                        .delay(600)
                        .duration(1500)
                        .attr("stroke", "black")
                        .selection()

                    g.append("text")
                        .attr("x", 48 + 20 * indice)
                        .attr("y", (_, i) => 253 + pokemon_card_separation * i)
                        .attr("fill", "black")
                        .text(type_array[indice])
                        .attr("font-size", 0)
                        .attr("transform", (_, i) => `rotate(270,${80 + 20 * indice},${260 + pokemon_card_separation * i})`)
                        .transition()
                        .delay(600)
                        .duration(1500)
                        .attr("font-size", 12)
                        .selection()
                }
                for (let indice = 0; indice < value_array.length; indice++) {
                    g.append("rect")
                        .attr("width", 20)
                        .attr("height", 20)
                        .attr("x", 60 + 20 * indice)
                        .attr("y", (_, i) => 300 + pokemon_card_separation * i)
                        .attr("fill", "transparent")
                        .attr("stroke", "transparent")
                        .transition()
                        .delay(600)
                        .duration(1500)
                        .attr("stroke", "black")
                        .attr("fill", d => Color_Scale(d[value_array[indice]]))
                        .selection()
                }
                for (let indice = 0; indice < weakness_values.length; indice++) {
                    g.append("rect")
                        .attr("width", 15)
                        .attr("height", 15)
                        .attr("x", 70 + 60 * indice)
                        .attr("y", (_, i) => 328 + pokemon_card_separation * i)
                        .attr("fill", "transparent")
                        .attr("stroke", "transparent")
                        .transition()
                        .delay(600)
                        .duration(1500)
                        .attr("stroke", "black")
                        .attr("fill", Color_Scale(weakness_values[indice]))
                        .selection()
                    g.append("text")
                        .attr("y", (_, i) => 340 + pokemon_card_separation * i)
                        .attr("x", 87 + 60 * indice)
                        .attr("font-size", 0)
                        .text(`x${weakness_values[indice]}`)
                        .transition()
                        .delay(600)
                        .duration(1500)
                        .attr("font-size", 12)
                        .selection()
                }

            },
            (update) => {
                try {
                    update
                        .transition()
                        .duration(1500)
                        .attr("transform", `translate(0,-${pokemon_card_separation * update.attr("pos")})`)
                        .selection()
                } catch (e) {
                }
            },
            (exit) =>
                exit
                    .remove()
        )
}

function calcular_cordenada_poligono(SA, HP, AT, DEF, SP, SD, cx, cy) {
    x1 = SA + cx
    y1 = cy
    x2 = cx + Math.cos(Math.PI / 3) * HP
    y2 = cy - Math.sin(Math.PI / 3) * HP
    x3 = cx - Math.cos(Math.PI / 3) * AT
    y3 = cy - Math.sin(Math.PI / 3) * AT
    x4 = cx - DEF
    y4 = cy
    x5 = cx - Math.cos(Math.PI / 3) * SP
    y5 = cy + Math.sin(Math.PI / 3) * SP
    x6 = cx + Math.cos(Math.PI / 3) * SD
    y6 = cy + Math.sin(Math.PI / 3) * SD
    return `${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4} ${x5},${y5} ${x6},${y6}`
}

function select(d, selected) {
    actualizar_detalle_pokemon(selected)
    pokedex.select(`[id="${d.id}"]`)
        .attr("class", "card selected")
    if (selected.length === 2) {
        check_heart()
    }
}

function deselect(d, selected) {
    actualizar_detalle_pokemon(selected)
    pokedex.select(`[id="${d.id}"]`)
        .attr("class", "card")
    hide_heart()
}


function marcar_selected(selected) {
    for (let index in selected) {
        pokedex.select(`[id="${selected[index].id}"]`)
            .attr("class", "card selected")
    }
}

function check_heart() {
    pokemon1 = selected[0]
    pokemon2 = selected[1]
    if (pokemon1.name === "Ditto" && pokemon2.egg_type_1 !== "Undiscovered") {
        show_heart("Ditto")
    } else if (pokemon2.name === "Ditto" && pokemon1.egg_type_1 !== "Undiscovered") {
        show_heart("Ditto")
    } else if (pokemon1.egg_type_1 === "Undiscovered" || pokemon2.egg_type1 === "Undiscovered") {
        //No breed
    } else if (pokemon1.egg_type_1 === pokemon2.egg_type_1 && pokemon1.egg_type_1 !== "") {
        show_heart(pokemon1.egg_type_1)
    } else if (pokemon1.egg_type_2 === pokemon2.egg_type_1 && pokemon1.egg_type_2 !== "") {
        show_heart(pokemon1.egg_type_2)
    } else if (pokemon1.egg_type_1 === pokemon2.egg_type_2 && pokemon1.egg_type_1 !== "") {
        show_heart(pokemon1.egg_type_1)
    } else if (pokemon1.egg_type_2 === pokemon2.egg_type_2 && pokemon1.egg_type_2 !== "") {
        show_heart(pokemon1.egg_type_2)
    } else {
                //No breed
}}

function hide_heart() {
    love.transition()
        .duration(500)
        .attr("stroke", "transparent")
        .attr("fill", "transparent")
    afinity_box.transition()
        .duration(500)
        .attr("fill","transparent")
        .attr("stroke","transparent")
    afinity_group_text.transition()
        .duration(500)
        .attr("fill","transparent")
        .selection()
        .text("")
}
function show_heart(family){
    love.transition()
        .delay(1000)
        .duration(500)
        .attr("stroke", "black")
        .attr("fill", "red")
    afinity_box.transition()
        .delay(1000)
        .duration(500)
        .attr("stroke","black")
        .attr("fill","white")
    afinity_group_text.transition()
        .delay(1400)
        .duration(500)
        .attr("fill","black")
        .text(family)
}

function type_2_url(d) {
    if (d.type_2 !== "") {
        return `https://www.serebii.net/pokedex-bw/type/${d.type_2.toLowerCase()}.gif`
    } else {
        return ""
    }
}

function calculate_dificulty_catch(value) {
    if (value <= 51) {
        return "Super Hard"
    } else if (value <= 102) {
        return "Hard"
    } else if (value <= 153) {
        return "Medium"
    } else if (value <= 204) {
        return "Easy"
    } else if (value <= 255) {
        return "Super Easy"
    } else {
        return "Guaranteed"
    }
}