<template>
<div id="app-sidebar-2" class="bg-bluegray-800 h-screen hidden lg:block flex-shrink-0 absolute lg:static left-0 top-0 z-1 select-none" style="width:280px">
    <div class="flex flex-column h-full">
        <div class="flex align-items-center px-5 bg-bluegray-900 flex-shrink-0" style="height:60px">
            <img src="/images/blocks/logos/hyper-300.svg" alt="Image" height="30" />
        </div>
        <div class="overflow-y-auto mt-3">
            <ul class="list-none p-3 m-0">
                <li>
                    <a v-ripple class="flex align-items-center cursor-pointer p-3 hover:bg-bluegray-900 border-round text-bluegray-100 hover:text-bluegray-50
                        transition-duration-150 transition-colors p-ripple">
                        <i class="pi pi-home mr-2"></i>
                        <span class="font-medium">Dashboard</span>
                    </a>
                </li>
                <li>
                    <a v-ripple class="flex align-items-center cursor-pointer p-3 hover:bg-bluegray-900 border-round text-bluegray-100 hover:text-bluegray-50
                        transition-duration-150 transition-colors p-ripple">
                        <i class="pi pi-bookmark mr-2"></i>
                        <span class="font-medium">Bookmarks</span>
                    </a>
                </li>
            </ul>
        </div>
        <div class="mt-auto">
            <hr class="mb-3 mx-3 border-top-1 border-none border-bluegray-600" />
            <ul class="list-none p-2 m-0 hidden origin-bottom animation-duration-150 overflow-hidden animation-ease-in-out">
                <li>
                    <a v-ripple class="flex align-items-center cursor-pointer p-3 hover:bg-bluegray-900 border-round text-bluegray-100 hover:text-bluegray-50
                    transition-duration-150 transition-colors p-ripple">
                        <i class="pi pi-cog mr-2"></i>
                        <span class="font-medium">Settings</span>
                    </a>
                </li>
                <li>
                    <a v-ripple class="flex align-items-center cursor-pointer p-3 hover:bg-bluegray-900 border-round text-bluegray-100 hover:text-bluegray-50
                    transition-duration-150 transition-colors p-ripple">
                        <i class="pi pi-sign-out mr-2"></i>
                        <span class="font-medium">Exit</span>
                    </a>
                </li>
            </ul>
            <a v-ripple class="m-3 px-3 py-2 flex align-items-center hover:bg-bluegray-900 border-round cursor-pointer text-bluegray-100 hover:text-bluegray-50
                transition-duration-150 transition-colors p-ripple"
                v-styleclass="{ selector: '@prev', enterClass: 'hidden', enterActiveClass: 'slidedown', leaveToClass: 'hidden', leaveActiveClass: 'slideup'}">
                <span class="font-medium">Menu</span>
                <i class="pi pi-chevron-up ml-auto"></i>
            </a>
        </div>
    </div>
</div>
    
</template>