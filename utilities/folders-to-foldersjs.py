# program to create folders.js programs from folders prog


import os
rootdir = 'C:/Users/Daniel/Source/Repos/Folders/Rottytooth.Esolang.Folders.SamplePrograms/PurePrograms/Hello World'
outstr = ""

def get_immediate_subdirectories(a_dir):
    return [name for name in os.listdir(a_dir)
            if os.path.isdir(os.path.join(a_dir, name))]

def encodedir(path):
    global outstr
    dirlist = get_immediate_subdirectories(path)
    if dirlist.count == 0:
        return
    i = 0
    for subdir in dirlist:
        i += 1
        outstr += "["
        encodedir(path + "/" + subdir)
        outstr += "]"
        if (i < len(dirlist)):
            outstr += ","

encodedir(rootdir)
print(outstr)
