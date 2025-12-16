"use client"

import * as React from "react"
import { useState } from "react"
import {
  AlertCircle,
  CheckCircle,
  Info,
  XCircle,
  User,
  Settings,
  Mail,
  Bell,
  Search,
  Menu,
  Calendar as CalendarIcon,
  ChevronRight,
} from "lucide-react"

// Import all components
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from "@/components/ui/table"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu"
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from "@/components/ui/command"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination"
import { Calendar } from "@/components/ui/calendar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { ModeToggle } from "@/components/mode-toggle"
import { useRouter } from "next/navigation"
import { createSupabaseBrowserClient } from "@/utils/supabase-browser"
import AccessControl from "@/components/access-control"
import { SystemRoles } from "@/enums/SystemRoles"

export default function Home() {
  const router = useRouter()
  const [progress, setProgress] = useState(33)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [commandOpen, setCommandOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const isMobile = useIsMobile()

  const handleLogout = async () => {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2 py-4">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Menu className="size-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Component Test</span>
                <span className="text-xs text-muted-foreground">All Components</span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <User className="size-4" />
                      <span>Profile</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Settings className="size-4" />
                      <span>Settings</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <div className="px-2 py-4">
              <AccessControl allowedRoles={[SystemRoles.ADMIN]}>
                ADMIN ONLY
              </AccessControl>
              <AccessControl allowedRoles={[SystemRoles.USER]}>
                USER ONLY
              </AccessControl>
              <Button variant="outline" size="sm" className="w-full">
                <Mail className="size-4 mr-2" />
                Contact
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-6" />
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Components</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-4 w-[400px]">
                      <NavigationMenuLink className="flex items-center gap-2 p-2 rounded-md hover:bg-accent">
                        <Button className="size-8" variant="outline" size="icon" />
                        <div>
                          <div className="font-medium">Buttons</div>
                          <div className="text-xs text-muted-foreground">Various button styles</div>
                        </div>
                      </NavigationMenuLink>
                      <NavigationMenuLink className="flex items-center gap-2 p-2 rounded-md hover:bg-accent">
                        <Card className="size-8 p-1" />
                        <div>
                          <div className="font-medium">Cards</div>
                          <div className="text-xs text-muted-foreground">Content containers</div>
                        </div>
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Button variant="ghost" asChild>
                    <a href="#alerts">Alerts</a>
                  </Button>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Button variant="ghost" asChild>
                    <a href="#dialogs">Dialogs</a>
                  </Button>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            <div className="ml-auto flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Bell className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Notifications</TooltipContent>
              </Tooltip>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <ModeToggle />
              <Button onClick={() => setCommandOpen(true)} variant="outline" size="icon">
                <Search className="size-4" />
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            <div className="mx-auto max-w-6xl space-y-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">Component Test Page</h1>
                <p className="text-muted-foreground mb-6">
                  This page demonstrates all available UI components
                </p>
                <Badge variant="default" className="mr-2">Default</Badge>
                <Badge variant="secondary" className="mr-2">Secondary</Badge>
                <Badge variant="destructive" className="mr-2">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>

              <Tabs defaultValue="buttons" className="w-full">
                <TabsList>
                  <TabsTrigger value="buttons">Buttons</TabsTrigger>
                  <TabsTrigger value="cards">Cards</TabsTrigger>
                  <TabsTrigger value="alerts">Alerts</TabsTrigger>
                  <TabsTrigger value="dialogs">Dialogs</TabsTrigger>
                  <TabsTrigger value="forms">Forms</TabsTrigger>
                  <TabsTrigger value="data">Data Display</TabsTrigger>
                </TabsList>

                <TabsContent value="buttons" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Buttons</CardTitle>
                      <CardDescription>Various button styles and sizes</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <Button variant="default">Default</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="destructive">Destructive</Button>
                        <Button variant="outline">Outline</Button>
                        <Button variant="ghost">Ghost</Button>
                        <Button variant="link">Link</Button>
                      </div>
                      <Separator />
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm">Small</Button>
                        <Button size="default">Default</Button>
                        <Button size="lg">Large</Button>
                        <Button size="icon">
                          <User className="size-4" />
                        </Button>
                      </div>
                      <Separator />
                      <div className="flex flex-wrap gap-2">
                        <Button disabled>Disabled</Button>
                        <Button variant="outline" disabled>Disabled Outline</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="cards" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Card Title</CardTitle>
                        <CardDescription>Card description goes here</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p>This is the card content area.</p>
                      </CardContent>
                      <CardFooter>
                        <Button>Action</Button>
                      </CardFooter>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Another Card</CardTitle>
                        <CardDescription>With different content</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>CN</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">John Doe</div>
                            <div className="text-sm text-muted-foreground">john@example.com</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="alerts" className="space-y-4">
                  <Alert>
                    <Info className="size-4" />
                    <AlertTitle>Info Alert</AlertTitle>
                    <AlertDescription>
                      This is an informational alert message.
                    </AlertDescription>
                  </Alert>
                  <Alert variant="destructive">
                    <XCircle className="size-4" />
                    <AlertTitle>Error Alert</AlertTitle>
                    <AlertDescription>
                      This is a destructive alert message.
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <CheckCircle className="size-4" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>
                      Operation completed successfully.
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <AlertCircle className="size-4" />
                    <AlertTitle>Warning</AlertTitle>
                    <AlertDescription>
                      Please review your settings before proceeding.
                    </AlertDescription>
                  </Alert>
                </TabsContent>

                <TabsContent value="dialogs" className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>Open Dialog</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Dialog Title</DialogTitle>
                          <DialogDescription>
                            This is a dialog component example.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <p>Dialog content goes here.</p>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                          <Button onClick={() => setDialogOpen(false)}>Confirm</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">Open Alert Dialog</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                      <DrawerTrigger asChild>
                        <Button>Open Drawer</Button>
                      </DrawerTrigger>
                      <DrawerContent>
                        <DrawerHeader>
                          <DrawerTitle>Drawer Title</DrawerTitle>
                          <DrawerDescription>
                            This is a drawer component example.
                          </DrawerDescription>
                        </DrawerHeader>
                        <div className="p-4">
                          <p>Drawer content goes here.</p>
                        </div>
                        <DrawerFooter>
                          <Button onClick={() => setDrawerOpen(false)}>Close</Button>
                        </DrawerFooter>
                      </DrawerContent>
                    </Drawer>

                    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                      <SheetTrigger asChild>
                        <Button>Open Sheet</Button>
                      </SheetTrigger>
                      <SheetContent>
                        <SheetHeader>
                          <SheetTitle>Sheet Title</SheetTitle>
                          <SheetDescription>
                            This is a sheet component example.
                          </SheetDescription>
                        </SheetHeader>
                        <div className="py-4">
                          <p>Sheet content goes here.</p>
                        </div>
                        <SheetFooter>
                          <Button onClick={() => setSheetOpen(false)}>Close</Button>
                        </SheetFooter>
                      </SheetContent>
                    </Sheet>
                  </div>
                </TabsContent>

                <TabsContent value="forms" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Form Elements</CardTitle>
                      <CardDescription>Input fields and form controls</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Input Field</label>
                        <Input placeholder="Enter text..." />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Progress Bar</label>
                        <Progress value={progress} />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => setProgress(Math.max(0, progress - 10))}>-</Button>
                          <Button size="sm" onClick={() => setProgress(Math.min(100, progress + 10))}>+</Button>
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Calendar</label>
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          className="rounded-md border"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="data" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Table</CardTitle>
                      <CardDescription>Data table example</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableCaption>A list of recent transactions</TableCaption>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Transaction</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead className="text-right">Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Payment from John</TableCell>
                            <TableCell><Badge variant="default">Completed</Badge></TableCell>
                            <TableCell>$250.00</TableCell>
                            <TableCell className="text-right">2024-01-15</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Subscription</TableCell>
                            <TableCell><Badge variant="secondary">Pending</Badge></TableCell>
                            <TableCell>$29.99</TableCell>
                            <TableCell className="text-right">2024-01-14</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Refund</TableCell>
                            <TableCell><Badge variant="destructive">Failed</Badge></TableCell>
                            <TableCell>-$50.00</TableCell>
                            <TableCell className="text-right">2024-01-13</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Skeletons</CardTitle>
                      <CardDescription>Loading placeholders</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <div className="flex gap-2">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-2/3" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Pagination</CardTitle>
                      <CardDescription>Page navigation</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious href="#" />
                          </PaginationItem>
                          <PaginationItem>
                            <PaginationLink href="#" isActive>1</PaginationLink>
                          </PaginationItem>
                          <PaginationItem>
                            <PaginationLink href="#">2</PaginationLink>
                          </PaginationItem>
                          <PaginationItem>
                            <PaginationLink href="#">3</PaginationLink>
                          </PaginationItem>
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                          <PaginationItem>
                            <PaginationNext href="#" />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Scroll Area</CardTitle>
                      <CardDescription>Scrollable content container</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-48 w-full rounded-md border p-4">
                        <div className="space-y-2">
                          {Array.from({ length: 20 }).map((_, i) => (
                            <div key={i} className="text-sm">
                              Item {i + 1} - This is scrollable content
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </SidebarInset>
      </div>

      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>
              <CalendarIcon className="size-4 mr-2" />
              <span>Calendar</span>
            </CommandItem>
            <CommandItem>
              <User className="size-4 mr-2" />
              <span>Profile</span>
            </CommandItem>
            <CommandItem>
              <Settings className="size-4 mr-2" />
              <span>Settings</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Navigation">
            <CommandItem>
              <span>Home</span>
              <CommandShortcut>⌘H</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <span>About</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </SidebarProvider>
  )
}
