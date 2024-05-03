const { Building } = require("../model")

module.exports = {
  getStudents: async function(buildingId) {
    const FloorController = require("./floor_controller")
    let users = []
    const building = await Building.findOne({ where: { id: buildingId } })
    const floors = await building.getFloors()
    for (let floor of floors) {
      const floorId = floor.id
      users = [...users, ...(await FloorController.getStudents(floorId))]
    }
    return users
  },
  delBuilding: async function(id) {
    const { setStudentRoomNull } = require("./user_controller")
    const students = await this.getStudents(id)
    // students.forEach(student => {
    //   setStudentRoomNull(student.id)
    // })
    if (students.length > 0) {
      return {
        code: 1,
        msg: "该宿舍楼下有学生，请先将学生移出宿舍楼"
      }
    }
    return await Building.destroy({ where: { id } })
  }
}
