import DxfParser from "dxf-parser";

const parseDXF = async (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file provided"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parser = new DxfParser();
        const dxf = parser.parseSync(e.target.result);

        // Temporary mapping: group name -> array of particle objects.
        const groupsMap = {};

        // Helper to ensure a group exists.
        const ensureGroup = (groupName) => {
          if (!groupsMap[groupName]) {
            groupsMap[groupName] = [];
          }
        };

        // Process points defined inside blocks.
        if (dxf.blocks) {
          Object.entries(dxf.blocks).forEach(([blockName, block]) => {
            if (block.entities) {
              ensureGroup(blockName);
              block.entities.forEach((entity) => {
                if (entity.type === "POINT") {
                  groupsMap[blockName].push({
                    xp: entity.position.x,
                    zp: entity.position.y, // Map DXF y-coordinate to zp.
                    up: 0,
                    wp: 0,
                    pm: 0,
                  });
                }
              });
            }
          });
        }

        // Process INSERT entities (instances of blocks with offsets).
        if (dxf.entities) {
          dxf.entities.forEach((entity) => {
            if (entity.type === "INSERT") {
              const blockName = entity.name;
              const block = dxf.blocks && dxf.blocks[blockName];
              if (block && block.entities) {
                ensureGroup(blockName);
                const baseX = entity.position.x || 0;
                const baseY = entity.position.y || 0;
                block.entities.forEach((blockEntity) => {
                  if (blockEntity.type === "POINT") {
                    groupsMap[blockName].push({
                      xp: (blockEntity.position.x || 0) + baseX,
                      zp: (blockEntity.position.y || 0) + baseY,
                      up: 0,
                      wp: 0,
                      pm: 0,
                    });
                  }
                });
              }
            }
          });
        }

        // Note: Standalone points are no longer grouped under "Ungrouped".
        // They will be ignored if not part of a block or insert.

        // Convert the groupsMap to parallel arrays: one for parts and one for particles.
        const parts = [];
        const particles = [];
        // Iterate over each group (key) and create an entry in parts and particles.
        Object.keys(groupsMap).forEach((groupName) => {
          if (groupsMap[groupName].length > 0) {
            parts.push({
              PartName: groupName,
              npPart: groupsMap[groupName].length,
              TypPart: "",
            });
            particles.push(groupsMap[groupName]);
          }
        });

        resolve({ parts, particles });
      } catch (error) {
        reject(error);
      }
    };

    reader.readAsText(file);
  });
};

export default parseDXF;
